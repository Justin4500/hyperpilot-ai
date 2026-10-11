import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Project root directory (d:\browser-use-main)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "HyperPilot AI"
    API_V1_PREFIX: str = "/api"
    
    # Gemini configuration
    # Read from GEMINI_API_KEY environment variable or backend .env
    GEMINI_API_KEY: str | None = None
    DEFAULT_MODEL: str = "gemini-3.5-flash-lite"
    
    # SQLite Database
    SQL_DATABASE_URL: str = f"sqlite:///{BACKEND_DIR / 'hyperpilot.db'}"
    
    # Browser Use settings
    BROWSER_HEADLESS: bool = False
    TASK_TIMEOUT_SECONDS: int = 180
    MAX_STEPS: int = 20
    
    # Safety Controls
    ALLOW_SENSITIVE_ACTIONS: bool = False
    
    class Config:
        env_file = [str(BACKEND_DIR / ".env"), str(BASE_DIR / ".env")]
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
