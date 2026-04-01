# 03_gap_analysis.md

## What already exists
1. Frontend shell exists
2. Routing exists
3. Pages exist for:
   - login
   - dashboard
   - tests
   - test runner
   - results
   - admin panel
4. UI style exists and is coherent

## What is still missing or only mocked
### Authentication / access
- no real login request
- no token/session logic
- no route protection by role
- no real logout flow
- sidebar/header show hardcoded identity

### Data layer
- no frontend API client structure
- no real backend integration
- no persistence layer in the repository root
- mock data is embedded in page components

### Tests domain
- no real test list retrieval
- no real test assignment to groups
- no real question storage
- no real attempts/history persistence

### Results domain
- results page uses mock data
- no teacher analytics view
- no detailed result drill-down by student/group/test

### Admin domain
- admin panel stores demo users only in client state
- no real create/update/delete calls
- no real roles/groups backend model

### Backend
- no visible Django backend yet
- no DRF API yet
- no PostgreSQL config yet

## MVP recommendation
### Frontend MVP
- stabilize current routing/imports
- create API layer
- implement auth context + protected routes
- replace mocks page by page

### Backend MVP
- scaffold Django + DRF in `/backend`
- create custom user with role
- create groups, tests, questions, attempts, results
- expose REST endpoints
- enable CORS for local frontend

## Non-goals for now
- no proctoring
- no audio/speaking grading
- no advanced adaptive testing
- no full LMS features
