# 05_runbook_environment.md

## Keep Vite
Do not remove Vite.
The current project already uses Vite scripts and React integration.
Changing build tools now would create unnecessary churn.

## Frontend local run
From the repository root:

```bash
npm install
npm run dev
```

Optional checks:

```bash
npm run build
npm run lint
```

## Planned frontend env file
Create `.env` in the repo root if needed:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Backend run (PostgreSQL required)

```bash
cd backend
docker compose up -d postgres
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# при необходимости скорректировать DATABASE_URL
export $(grep -v '^#' .env | xargs)
python manage.py migrate
python manage.py runserver
```

## Planned backend env
Example:

```env
DEBUG=True
SECRET_KEY=change-me
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/diploma_project
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Important:
- PostgreSQL is mandatory for backend startup.
- SQLite fallback is intentionally disabled.

## Codex cloud setup behavior
If backend cannot be fully started in the execution environment due missing network/dependency access, the run should still:
- update backend config/code/docs to require PostgreSQL
- keep frontend checks/build passing
- clearly report which backend commands must be executed locally
