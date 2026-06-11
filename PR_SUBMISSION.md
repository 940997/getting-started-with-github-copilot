PR Submission Checklist
======================

Repository: getting-started-with-github-copilot
Branch: accelerate-with-copilot
Pull Request: https://github.com/940997/getting-started-with-github-copilot/pull/2

Purpose
-------
This file documents the steps to verify and submit the exercise changes so the exercise runner or reviewer can confirm completion.

Checklist
---------
- [x] Code is pushed to branch `accelerate-with-copilot` and PR opened (#2).
- [x] Backend persists activities to `src/activities.json` (see `src/app.py`).
- [x] Frontend shows participants and allows removal (`src/static/app.js`, `src/static/styles.css`).
- [x] Basic manual tests performed: signup and unregister via API and UI.

How to run locally
-------------------
1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the app:

```bash
uvicorn src.app:app --reload --host 0.0.0.0 --port 8000
```

3. Open the app in your browser:

- Frontend: http://localhost:8000
- API: http://localhost:8000/activities
- Docs: http://localhost:8000/docs

What I validated
----------------
- Signed up `tester@mergington.edu` for `Chess Club` via API — changes persisted in `src/activities.json`.
- Signed up `browsertest2@mergington.edu` for `Swimming Club` via API — verified persisted.
- Frontend updated to show participants and remove icons; optimistic DOM update added so signup appears immediately.

Notes for the exercise runner
----------------------------
- If the exercise runner expects a repository named `skills-getting-started-with-github-copilot`, please copy this repo into that name or follow the exercise instructions for submission.
- If CI/Actions need to run, wait for GitHub Actions to complete on the PR page.

If you want, I can also add a short demo GIF or automated test script to demonstrate the signup/unregister flows.
