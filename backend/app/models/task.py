import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Float, Integer, JSON
from app.core.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    prompt = Column(Text, nullable=False)
    category = Column(String(50), default="custom")
    model = Column(String(100), default="gemini-3.8-flash")
    status = Column(String(30), default="pending")  # pending, running, completed, failed, cancelled
    
    result_text = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    steps_count = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    
    # Execution trace: logs, actions, visited urls, screenshots
    actions = Column(JSON, default=list)
    logs = Column(JSON, default=list)
    visited_urls = Column(JSON, default=list)
    screenshot_url = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
