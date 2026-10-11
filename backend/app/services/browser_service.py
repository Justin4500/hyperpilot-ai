import asyncio
import os
import time
import logging
import base64
from pathlib import Path
from typing import Dict

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.task import Task
from app.core.safety import validate_url_safety, check_prompt_sensitivity

from browser_use import Agent, Browser, ChatGoogle
from browser_use.browser.chrome import find_chrome_executable

logger = logging.getLogger("hyperpilot.browser_service")

# Map of active asyncio background tasks for cancellation
_active_tasks: Dict[str, asyncio.Task] = {}

def get_gemini_key() -> str | None:
    """Retrieve Gemini API key from environment or settings."""
    return os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY or os.environ.get("GOOGLE_API_KEY")

def is_gemini_configured() -> bool:
    key = get_gemini_key()
    return bool(key and key.strip())

async def run_browser_automation(task_id: str):
    """
    Background executor for running a browser automation task.
    Updates the database with execution status, logs, steps, and results.
    """
    db = SessionLocal()
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        db.close()
        return

    # Check for Gemini API key
    gemini_key = get_gemini_key()
    if not gemini_key:
        task.status = "failed"
        task.error_message = (
            "Google Gemini API key is not configured. "
            "Please obtain a free API key from https://aistudio.google.com/ "
            "and add GEMINI_API_KEY=your_key to your backend .env file."
        )
        task.logs = [
            "Task initialized.",
            "ERROR: Missing GEMINI_API_KEY in backend environment.",
            "Non-AI capabilities remain operational.",
        ]
        db.commit()
        db.close()
        return

    # Safety: check prompt sensitivity
    is_sensitive, warning = check_prompt_sensitivity(task.prompt)
    if is_sensitive and not settings.ALLOW_SENSITIVE_ACTIONS:
        task.status = "failed"
        task.error_message = (
            f"Safety Policy Gate: {warning} "
            "Consequential actions like financial transactions or account deletion are blocked by default for safety."
        )
        task.logs = [
            "Task initialized.",
            f"SAFETY VIOLATION: {warning}",
            "Task aborted before browser execution.",
        ]
        db.commit()
        db.close()
        return

    # Start task execution
    task.status = "running"
    task.logs = [
        "Task started.",
        f"Selected AI Model: {task.model}",
        "Connecting to browser automation engine...",
    ]
    db.commit()

    start_time = time.time()
    browser = None

    try:
        # Resolve model: use fast, stable free-tier model (gemini-3.5-flash-lite)
        active_model = task.model or settings.DEFAULT_MODEL
        if active_model == "gemini-3.8-flash":
            active_model = "gemini-3.5-flash-lite"

        llm = ChatGoogle(
            model=active_model,
            api_key=gemini_key,
        )
        fallback_llm = ChatGoogle(
            model="gemini-3.5-flash",
            api_key=gemini_key,
        )

        # Setup local browser instance
        browser = Browser(
            headless=settings.BROWSER_HEADLESS,
        )

        # Step callback for live progress updates into database
        async def on_step_callback(browser_state, model_output, step_num):
            try:
                task.steps_count = step_num
                action_info = f"Step {step_num}: Executing action."
                task.logs = list(task.logs) + [action_info]
                db.commit()
            except Exception as e:
                logger.warning(f"Error in step callback: {e}")

        # Configure agent for fast execution without vision latency bottlenecks
        agent = Agent(
            task=task.prompt,
            llm=llm,
            fallback_llm=fallback_llm,
            browser=browser,
            use_vision=False,
            flash_mode=True,
            directly_open_url=True,
            register_new_step_callback=on_step_callback,
        )

        # Append progress log
        task.logs = list(task.logs) + [
            "Browser initialized successfully.",
            f"Executing prompt: '{task.prompt[:100]}...'",
        ]
        db.commit()

        # Execute agent with step limit
        history = await asyncio.wait_for(
            agent.run(max_steps=settings.MAX_STEPS),
            timeout=settings.TASK_TIMEOUT_SECONDS
        )

        duration = time.time() - start_time
        task.duration_seconds = round(duration, 2)
        task.steps_count = history.number_of_steps() if hasattr(history, "number_of_steps") else len(history.history)

        # Visited URLs
        if hasattr(history, "urls"):
            task.visited_urls = history.urls()
        
        # Action details
        action_list = []
        if hasattr(history, "action_names"):
            for idx, action_name in enumerate(history.action_names()):
                action_list.append({
                    "step": idx + 1,
                    "action": action_name,
                    "timestamp": time.strftime("%H:%M:%S"),
                })
        task.actions = action_list

        # Final result extraction
        final_res = None
        if hasattr(history, "final_result"):
            final_res = history.final_result()
        if not final_res and hasattr(history, "extracted_content"):
            extracted = history.extracted_content()
            if extracted:
                final_res = "\n\n".join(str(e) for e in extracted if e)

        task.result_text = final_res or "Task completed successfully."
        task.status = "completed"
        task.logs = list(task.logs) + [
            f"Execution finished in {task.duration_seconds} seconds.",
            f"Completed steps: {task.steps_count}.",
            "Extracted result saved successfully.",
        ]

        # Extract latest screenshot if available
        if hasattr(history, "screenshots"):
            screenshots = history.screenshots()
            if screenshots and len(screenshots) > 0:
                task.screenshot_url = f"data:image/png;base64,{screenshots[-1]}"

        db.commit()

    except asyncio.CancelledError:
        duration = time.time() - start_time
        task.status = "cancelled"
        task.duration_seconds = round(duration, 2)
        task.error_message = "Task was cancelled by user."
        task.logs = list(task.logs) + ["Task was cancelled by user request."]
        db.commit()
    except asyncio.TimeoutError:
        duration = time.time() - start_time
        task.status = "failed"
        task.duration_seconds = round(duration, 2)
        task.error_message = f"Task timed out after {settings.TASK_TIMEOUT_SECONDS} seconds."
        task.logs = list(task.logs) + [f"Task timed out after {settings.TASK_TIMEOUT_SECONDS}s."]
        db.commit()
    except Exception as e:
        import traceback
        duration = time.time() - start_time
        task.status = "failed"
        task.duration_seconds = round(duration, 2)
        error_str = str(e) or repr(e)
        logger.error(f"Automation task {task_id} failed: {traceback.format_exc()}")
        
        # Friendly Google Free Tier quota / error messages
        if "429" in error_str or "quota" in error_str.lower() or "resource_exhausted" in error_str.lower():
            friendly_err = (
                "Google Gemini Free Tier Quota Limit Reached (HTTP 429). "
                "Google AI Studio rate limits free tier requests per minute. Please wait a minute and retry."
            )
        elif "API_KEY_INVALID" in error_str or "unauthenticated" in error_str.lower() or "401" in error_str:
            friendly_err = "Gemini API key is invalid or unauthorized. Please verify the key at https://aistudio.google.com/."
        else:
            friendly_err = f"Automation Error: {error_str}"

        task.error_message = friendly_err
        task.logs = list(task.logs) + [f"ERROR: {friendly_err}", f"DEBUG: {repr(e)}"]
        db.commit()
    finally:
        # Cleanup browser resources
        if browser is not None:
            try:
                await browser.close()
            except Exception:
                pass
        _active_tasks.pop(task_id, None)
        db.close()

def start_task_execution(task_id: str):
    """Start the asynchronous browser automation task in the background loop."""
    try:
        loop = asyncio.get_running_loop()
        async_task = loop.create_task(run_browser_automation(task_id))
    except RuntimeError:
        # Fallback if called outside an active event loop
        loop = asyncio.new_event_loop()
        import threading
        t = threading.Thread(target=lambda: loop.run_until_complete(run_browser_automation(task_id)), daemon=True)
        t.start()
        return None
    _active_tasks[task_id] = async_task
    return async_task

def cancel_task_execution(task_id: str) -> bool:
    """Cancel an active background task if running."""
    if task_id in _active_tasks:
        async_task = _active_tasks[task_id]
        async_task.cancel()
        return True
    return False
