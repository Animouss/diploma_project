# Diploma Project — Система языкового тестирования иностранных студентов

Практическая часть дипломного проекта:
**«Разработка информационной системы языкового тестирования иностранных студентов»**.

## Что это за система
Веб-система для проведения тестирования по русскому языку в университетском контексте с ролями:
- **student**
- **teacher**
- **admin**

Ключевые возможности текущего MVP:
- аутентификация и ролевой доступ,
- админ-управление пользователями, группами, тестами, вопросами, вариантами и назначениями,
- назначение тестов группам,
- прохождение теста студентом,
- сохранение ответов и завершение попытки,
- автоматический подсчёт результата для закрытых вопросов,
- просмотр результатов студентом и teacher/admin.

## Стек
- Frontend: **React + Vite + react-router-dom**
- Backend: **Django + Django REST Framework**
- DB: **PostgreSQL** (обязательно)
- Auth: DRF Token Authentication

## Структура
- `src/` — frontend
- `backend/` — Django backend
- `docs/codex/` — внутренние runbook/checklist документы

## Запуск backend (PostgreSQL required)

```bash
cd backend
docker compose up -d postgres

python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt

cp .env.example .env
export $(grep -v '^#' .env | xargs)

python manage.py migrate
python manage.py runserver
```

Backend API по умолчанию: `http://localhost:8000/api/...`

## Запуск frontend

В корне проекта:

```bash
npm install
npm run dev
```

Если нужно, задайте API базу в `.env` (корень репозитория):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Demo seed для защиты

После запуска backend выполните:

```bash
cd backend
source .venv/bin/activate
export $(grep -v '^#' .env | xargs)
python manage.py seed_demo_data
```

Команда создаёт/обновляет:
- группу,
- пользователей `admin_demo`, `teacher_demo`, `student_demo`,
- опубликованный и назначенный тест,
- пример завершённой попытки и результата.

Demo credentials:
- `admin_demo / admin123`
- `teacher_demo / teacher123`
- `student_demo / student123`

## Текущие ограничения
- пока нет полноценной аналитики и отчётов уровня BI,
- не реализованы proctoring/LMS-функции (вне scope дипломного MVP).
