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

## Planned backend run
If/when backend is scaffolded:

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Planned backend env
Example:

```env
DEBUG=True
SECRET_KEY=change-me
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/diploma_project
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Codex cloud setup behavior
If backend does not exist yet, the setup should at least:
- install frontend dependencies
- verify build/lint commands
- avoid failing just because backend is not created yet

If backend exists later, setup can expand to install Python dependencies too.
