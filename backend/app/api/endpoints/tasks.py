import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreateRequest, TaskResponse
from app.services.browser_service import start_task_execution, cancel_task_execution

router = APIRouter()

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(req: TaskCreateRequest, db: Session = Depends(get_db)):
    """
    Submit a new natural language browser automation task.
    Saves to SQLite and triggers background execution.
    """
    new_task = Task(
        id=str(uuid.uuid4()),
        prompt=req.prompt,
        category=req.category,
        model=req.model,
        status="pending",
        logs=["Task queued for execution."],
        actions=[],
        visited_urls=[],
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Launch background browser automation
    start_task_execution(new_task.id)

    return new_task

@router.get("/tasks", response_model=List[TaskResponse])
def get_all_tasks(limit: int = 50, db: Session = Depends(get_db)):
    """
    Retrieve all tasks sorted by most recently created.
    """
    tasks = db.query(Task).order_by(Task.created_at.desc()).limit(limit).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)):
    """
    Retrieve details, logs, actions, and output of a specific task.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/tasks/{task_id}/cancel", response_model=TaskResponse)
def cancel_task(task_id: str, db: Session = Depends(get_db)):
    """
    Cancel an active task.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    cancelled = cancel_task_execution(task_id)
    if task.status in ("pending", "running"):
        task.status = "cancelled"
        task.logs = list(task.logs or []) + ["Task cancellation initiated."]
        db.commit()
        db.refresh(task)

    return task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, db: Session = Depends(get_db)):
    """
    Delete a task and its history from the database.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    cancel_task_execution(task_id)
    db.delete(task)
    db.commit()
    return None

@router.delete("/tasks", status_code=status.HTTP_200_OK)
def clear_all_tasks(db: Session = Depends(get_db)):
    """
    Clear all tasks history.
    """
    count = db.query(Task).delete()
    db.commit()
    return {"message": f"Successfully deleted {count} tasks"}
