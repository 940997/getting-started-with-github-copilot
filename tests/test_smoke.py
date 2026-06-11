import json
from pathlib import Path

from fastapi.testclient import TestClient


ROOT = Path(__file__).resolve().parents[1]
ACTIVITIES_FILE = ROOT / "src" / "activities.json"


def backup_activities():
    try:
        return json.loads(ACTIVITIES_FILE.read_text(encoding="utf-8"))
    except Exception:
        return None


def restore_activities(data):
    if data is None:
        return
    ACTIVITIES_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def test_signup_and_unregister_flow():
    from src.app import app

    backup = backup_activities()
    client = TestClient(app)

    # Get current activities
    r = client.get("/activities")
    assert r.status_code == 200
    activities = r.json()
    assert isinstance(activities, dict)

    activity_name = next(iter(activities))
    test_email = "ci-test@example.com"

    # Sign up
    r = client.post(f"/activities/{activity_name}/signup?email={test_email}")
    assert r.status_code == 200

    # Verify signup persisted in API
    r = client.get("/activities")
    assert test_email in r.json()[activity_name]["participants"]

    # Unregister
    r = client.delete(f"/activities/{activity_name}/participants?email={test_email}")
    assert r.status_code == 200

    # Verify removal
    r = client.get("/activities")
    assert test_email not in r.json()[activity_name]["participants"]

    # restore
    restore_activities(backup)
