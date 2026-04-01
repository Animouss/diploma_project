# 06_acceptance_checklist.md

Use this checklist before closing a Codex run.

## Preservation
- [ ] Existing frontend was preserved
- [ ] Existing design language was preserved
- [ ] Vite was not removed unnecessarily
- [ ] Existing pages were improved instead of rebuilt from zero

## Technical correctness
- [ ] imports/path casing are correct for Linux/cloud environments
- [ ] routes are valid
- [ ] no dead page links
- [ ] mock data replacements are clearly isolated

## Product progress
- [ ] at least one real diploma requirement was implemented
- [ ] auth/RBAC progress is real, not only placeholder text
- [ ] tests/results/admin flows moved closer to real API-backed behavior

## Validation
- [ ] frontend install succeeded
- [ ] frontend build succeeded
- [ ] lint run was attempted
- [ ] backend checks were run if backend exists

## Reporting
- [ ] changed files listed
- [ ] assumptions listed
- [ ] remaining gaps listed
