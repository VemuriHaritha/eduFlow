# Contributing to EduFlow

Thanks for your interest in contributing! This document covers how to get set up and the conventions used in this project.

## Getting Started

1. Fork the repository and clone your fork:
```bash
   git clone https://github.com/<your-username>/eduflow.git
   cd eduflow
```
2. Follow the [Installation](./README.md#-installation) steps in the README to get both the backend and frontend running locally.
3. Create a branch for your change:
```bash
   git checkout -b feature/short-description
```

## Branch Naming

| Prefix | Use for |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code changes with no behavior change |
| `chore/` | Tooling, dependencies, config |

## Commit Messages

Use clear, present-tense commit messages.
## Code Style

- Backend: CommonJS, async/await, controllers stay thin — business logic belongs in controllers, not routes
- Frontend: functional components with hooks, Tailwind utility classes (avoid custom CSS unless necessary)
- Keep components focused — extract a subcomponent if a file grows past ~200 lines
- Run existing code through your editor's formatter before committing

## Pull Requests

1. Make sure your branch is up to date with `main`:
```bash
   git fetch origin
   git rebase origin/main
```
2. Verify both apps still build:
```bash
   cd backend && npm install && node --check server.js
   cd ../frontend && npm install && npm run build
```
3. Open a PR against `main` with:
   - A clear title and description of the change
   - Screenshots for any UI changes
   - A note on any new environment variables (update `.env.example` and the README's Environment Variables table)
4. Link any related issue in the PR description.

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or console/network errors if relevant
- Your environment (OS, Node version, browser)

## Feature Requests

Open an issue describing the use case and proposed behavior before submitting a large PR — this avoids duplicated effort if the feature is already planned or out of scope.

## Code of Conduct

Be respectful and constructive. Assume good intent, and keep feedback focused on the code, not the person.
