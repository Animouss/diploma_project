# Backend (Django + DRF, PostgreSQL required)

## 1) Start PostgreSQL locally (Docker Compose)

```bash
cd backend
docker compose up -d postgres
docker compose ps
```

PostgreSQL будет доступен на `localhost:5432`.

## 2) Configure environment

Создайте `.env` в каталоге `backend` (можно копировать из `.env.example`):

```env
DEBUG=True
SECRET_KEY=change-me
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/diploma_project
```

## 3) Run Django backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export $(grep -v '^#' .env | xargs)
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## API

### Auth
- `POST /api/auth/login/`
- `GET /api/auth/me/`
- `POST /api/auth/logout/`

### Tests
- `GET /api/tests/`

`login` returns DRF token; frontend sends `Authorization: Token <token>`.

## Important

SQLite fallback is intentionally disabled.
Backend startup requires PostgreSQL `DATABASE_URL`.
