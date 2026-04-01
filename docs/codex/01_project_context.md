# 01_project_context.md

## What this project is
This repository is the practical implementation of a diploma project about an information system for language testing of foreign students in a university context.

## What the system must become
The diploma target is a specialized web information system that:
- reduces time spent on testing and result processing
- provides more objective checking for auto-checkable tasks
- supports multiple roles
- stores attempts and results
- provides teacher/admin visibility into results

## Core product roles
- Student
- Teacher
- Admin

## Core product capabilities
- login/authentication
- role-based access
- create and manage users
- create and manage tests/questions
- assign tests to groups
- student test-taking flow
- timer and answer saving
- automatic scoring
- result history
- teacher/admin result views

## Technical direction from the diploma
- client side: React
- server side: Django / DRF
- database: PostgreSQL

## Important implementation constraint
The existing frontend already exists and must be used as the starting point.
The agent must not restart the frontend from zero.
