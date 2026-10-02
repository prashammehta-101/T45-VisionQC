import pytest
pytest.importorskip("multipart", reason="Install backend/requirements.txt for multipart API tests")
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_empty_stats():
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert client.get("/api/stats").status_code == 200

def test_rejects_non_image_upload():
    response = client.post("/api/inspect", files={"file": ("bad.txt", b"not an image", "text/plain")})
    assert response.status_code == 415
