# 04_target_architecture.md

## Desired repository shape after Codex work

### Frontend
Keep the current frontend in the repo root.

Suggested additions:
- `src/api/`
- `src/services/`
- `src/hooks/`
- `src/context/`
- `src/utils/`

Example:
- `src/api/client.js`
- `src/api/auth.js`
- `src/api/tests.js`
- `src/api/results.js`
- `src/context/AuthContext.jsx`
- `src/components/ProtectedRoute.jsx`

### Backend
Create:
- `backend/`
  - Django project
  - DRF
  - apps:
    - `users`
    - `groups` or `academics`
    - `tests`
    - `attempts`
    - `results`

## Recommended first backend entities
- User(role, full_name, username, password hash, is_active)
- StudentGroup(name, code)
- Test(title, level, duration_minutes, is_published)
- Question(test, type, text, order, points)
- Option(question, text, is_correct, order)
- TestAssignment(test, group)
- Attempt(user, test, started_at, finished_at, status, score_percent)
- Answer(attempt, question, selected_option or text_answer)
- Result(attempt, score_percent, level_result, passed)

## API direction
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`

- `GET /api/tests/`
- `GET /api/tests/:id/`
- `POST /api/tests/:id/start/`
- `POST /api/attempts/:id/answers/`
- `POST /api/attempts/:id/finish/`

- `GET /api/results/me/`
- `GET /api/results/test/:id/`
- `GET /api/results/group/:id/`

- `GET /api/users/`
- `POST /api/users/`
- `GET /api/groups/`

## Frontend page goals
- `login.jsx`: real auth flow
- `Dashboard.jsx`: user-specific summary
- `Tests.jsx`: available assigned tests
- `TestRunner.jsx`: real fetched test + attempt lifecycle
- `Results.jsx`: actual attempt history
- `AdminPanel.jsx`: user/group/test administration
