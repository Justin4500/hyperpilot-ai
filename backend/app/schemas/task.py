from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field

class TaskCreateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=5000, description="The natural language task prompt")
    category: str = Field("custom", description="Category of task (e.g., research, shopping, travel, productivity, custom)")
    model: str = Field("gemini-3.8-flash", description="AI model to use")
    require_confirmation: bool = Field(False, description="Whether to require explicit safety confirmations")

class TaskActionItem(BaseModel):
    step: int
    action: str
    description: str | None = None
    timestamp: str | None = None

class TaskResponse(BaseModel):
    id: str
    prompt: str
    category: str
    model: str
    status: str
    result_text: str | None = None
    error_message: str | None = None
    steps_count: int = 0
    duration_seconds: float = 0.0
    actions: list[Any] = []
    logs: list[str] = []
    visited_urls: list[str] = []
    screenshot_url: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SystemHealthResponse(BaseModel):
    status: str
    gemini_configured: bool
    gemini_key_source: str | None = None
    browser_available: bool
    browser_path: str | None = None
    default_model: str
    available_models: list[str]
    tasks_count: int
