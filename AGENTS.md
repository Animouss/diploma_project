# AGENTS.md

## Project identity
This repository is the practical part of the diploma project:
"Разработка информационной системы языкового тестирования иностранных студентов".

The goal is not to build a generic LMS.
The goal is to complete a specialized language-testing web system for a university context.

## Current repository reality
The repository already contains a working React frontend scaffold.
Do NOT rebuild the frontend from scratch.
Do NOT replace the stack with Next.js, Tailwind, MUI, Chakra, shadcn, Redux, or another large framework unless explicitly required.
Keep the existing structure and evolve it carefully.

Current frontend baseline:
- Vite-based React app in the repository root
- react-router-dom routing
- existing pages already created
- existing CSS design already created in `src/index.css`

Important:
Vite is acceptable and should be kept.
It is only a build/dev tool for the current React frontend.
Do not remove Vite unless there is a very strong technical reason.

## Hard design constraint
Preserve the current visual style.
The current UI already has a consistent visual language:
- dark sidebar
- white header
- white rounded cards
- indigo accent color
- simple tables
- soft shadows
- no radical redesign

You may improve polish and consistency, but do not radically change:
- page layout
- color palette
- component style
- overall look and feel

## Product scope from the diploma
The target system must move toward these capabilities:
- authentication and authorization
- role separation: student / teacher / admin
- user and group management
- tests and questions
- assigning tests to groups
- taking tests in the browser
- timer, answer saving, attempt history
- automatic scoring of closed questions
- student result pages
- teacher/admin analytical views
- backend API
- PostgreSQL-backed persistence

## Current coding strategy
Use the current frontend as the base.
Convert mock pages into a real MVP incrementally.

Implementation order:
1. stabilize the current frontend structure and routing
2. remove obvious technical inconsistencies and broken imports
3. define shared domain models and API layer on frontend
4. if backend is absent, scaffold Django + DRF in `/backend`
5. implement auth + RBAC first
6. implement tests / questions / attempts / results flow
7. replace mocks gradually, page by page
8. keep changes reviewable

## Frontend rules
- Keep React + react-router-dom.
- Keep the current CSS file and class naming style.
- Prefer plain React state/hooks unless a larger state layer becomes clearly necessary.
- Introduce a small `src/api/` and `src/services/` layer instead of spreading fetch logic everywhere.
- If you add reusable UI, place it into `src/components/`.
- Keep page-level orchestration inside `src/pages/`.
- Preserve Russian UI texts.

## Backend rules
If backend is missing, create:
- `/backend`
- Django project
- Django REST Framework
- user roles
- domain apps for tests / attempts / results

Prefer this API structure:
- `/api/auth/...`
- `/api/users/...`
- `/api/groups/...`
- `/api/tests/...`
- `/api/attempts/...`
- `/api/results/...`

Use PostgreSQL as the target DB.
SQLite can be tolerated only for initial bootstrap if PostgreSQL is unavailable in the execution environment, but the code should clearly target PostgreSQL in configuration.

## Data model direction
Core entities should align with the diploma:
- User
- Group
- Test
- Question
- Option
- Assignment
- Attempt
- Answer
- Result

Closed, auto-checkable questions are the first priority.

## Safety / scope discipline
- Do not invent features outside the diploma scope.
- Do not add proctoring.
- Do not build a full course LMS.
- Do not spend large effort on animations.
- Prefer deterministic, understandable code.

## Validation expectations
Before finishing a task:
- run frontend install/build/lint if available
- run backend checks/migrations/tests if backend exists
- summarize exactly what changed
- list remaining gaps

## Definition of done for each run
A run is complete only if:
1. repository was inspected first
2. current code was preserved and extended rather than replaced
3. real code changes were made
4. checks were run when possible
5. output clearly states what was implemented and what remains
