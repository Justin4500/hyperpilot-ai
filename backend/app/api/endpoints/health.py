import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.task import Task
from app.schemas.task import SystemHealthResponse
from app.services.browser_service import is_gemini_configured, get_gemini_key
from browser_use.browser.chrome import find_chrome_executable

router = APIRouter()

SUPPORTED_FREE_TIER_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
]

@router.get("/health", response_model=SystemHealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    """
    Get full system health, configuration state, and browser diagnostics.
    Does NOT reveal any secret API key strings.
    """
    chrome_path = find_chrome_executable()
    has_gemini = is_gemini_configured()
    key_source = None
    if has_gemini:
        if os.environ.get("GEMINI_API_KEY"):
            key_source = "GEMINI_API_KEY (env)"
        elif settings.GEMINI_API_KEY:
            key_source = ".env file"
        elif os.environ.get("GOOGLE_API_KEY"):
            key_source = "GOOGLE_API_KEY (env)"

    total_tasks = db.query(Task).count()

    return SystemHealthResponse(
        status="healthy",
        gemini_configured=has_gemini,
        gemini_key_source=key_source,
        browser_available=bool(chrome_path),
        browser_path=chrome_path,
        default_model=settings.DEFAULT_MODEL,
        available_models=SUPPORTED_FREE_TIER_MODELS,
        tasks_count=total_tasks,
    )
