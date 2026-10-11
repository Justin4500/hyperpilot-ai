import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.safety import validate_url_safety, check_prompt_sensitivity

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "HyperPilot AI"
    assert data["status"] == "online"

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "gemini_configured" in data
    assert "browser_available" in data
    assert "available_models" in data
    assert len(data["available_models"]) > 0

def test_task_creation_and_retrieval():
    payload = {
        "prompt": "Test automation prompt to check backend functionality",
        "category": "research",
        "model": "gemini-2.0-flash",
    }
    create_res = client.post("/api/tasks", json=payload)
    assert create_res.status_code == 201
    task = create_res.json()
    assert task["prompt"] == payload["prompt"]
    assert task["category"] == "research"
    assert "id" in task
    task_id = task["id"]

    # Retrieve specific task
    get_res = client.get(f"/api/tasks/{task_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == task_id

    # Retrieve list
    list_res = client.get("/api/tasks")
    assert list_res.status_code == 200
    tasks = list_res.json()
    assert any(t["id"] == task_id for t in tasks)

    # Cancel task
    cancel_res = client.post(f"/api/tasks/{task_id}/cancel")
    assert cancel_res.status_code == 200

    # Delete task
    del_res = client.delete(f"/api/tasks/{task_id}")
    assert del_res.status_code == 204

def test_safety_url_validation():
    # Loopback and internal
    safe, msg = validate_url_safety("http://127.0.0.1:8080/admin")
    assert not safe
    
    safe, msg = validate_url_safety("http://localhost:3000")
    assert not safe
    
    safe, msg = validate_url_safety("http://169.254.169.254/latest/meta-data/")
    assert not safe

    # Valid external
    safe, msg = validate_url_safety("https://en.wikipedia.org/wiki/Artificial_intelligence")
    assert safe

def test_safety_prompt_sensitivity():
    sensitive, reason = check_prompt_sensitivity("Please go to store.com and purchase this laptop with credit card")
    assert sensitive
    assert "purchase" in reason or "credit card" in reason

    benign, reason = check_prompt_sensitivity("Search for python courses and list the top 3 with pricing")
    assert not benign
