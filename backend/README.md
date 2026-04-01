# Backend (Django + DRF)

## Быстрый запуск

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## API

### Auth
- `POST /api/auth/login/`
- `GET /api/auth/me/`
- `POST /api/auth/logout/`

### Tests (первый domain slice)
- `GET /api/tests/` — список доступных тестов для текущего пользователя

`login` возвращает DRF token; клиент отправляет `Authorization: Token <token>`.

## База данных

- По умолчанию используется SQLite для локальной разработки.
- Для production/staging проект нацелен на PostgreSQL через `DATABASE_URL`.
