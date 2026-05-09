# Backend (Django + DRF, PostgreSQL required)

## 1) Start PostgreSQL locally

```bash
cd backend
docker compose up -d postgres
docker compose ps
```

## 2) Configure environment

```bash
cp .env.example .env
export $(grep -v '^#' .env | xargs)
```

`DATABASE_URL` is required and must point to PostgreSQL.

## 3) Run backend

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Useful commands

```bash
python manage.py check
python manage.py createsuperuser
python manage.py seed_demo_data
```

## Demo seed credentials
- `admin_demo / admin123`
- `teacher_demo / teacher123`
- `student_demo / student123`

## Key API groups
- `/api/auth/...`
- `/api/tests/...`
- `/api/attempts/...`
- `/api/results/...`
- `/api/admin/...`
