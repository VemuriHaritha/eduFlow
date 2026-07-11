# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]
### Planned
- Cloud file storage (Cloudinary/S3) for persistence across deploys
- Email verification and password reset
- Automated test suite

## [1.2.0] — 2026-07-11
### Added
- `fileUrl()` helper to resolve uploaded file paths against the API's origin, so the deployed frontend and backend can live on different domains
- `VITE_API_URL` environment variable to point the frontend at any backend (local or deployed) without code changes
### Fixed
- CORS misconfiguration causing login/API failures on the deployed Render frontend (`CLIENT_URL` now matches the deployed frontend origin)
- SPA route refresh returning 404 on Render static hosting (added rewrite rule to `index.html`)

## [1.1.0] — 2026-07-11
### Added
- Quizzes and Assignments are now visible and actionable directly on the Course Details page for enrolled students (previously created but never surfaced in the UI)
- Certificate button now appears on the last lesson once a course is 100% complete, replacing the "Next Lesson" button

## [1.0.0] — 2026-07-10
### Added
- Initial release: full MERN LMS
- JWT authentication with role-based access (student / instructor / admin)
- Course, lesson, quiz, and assignment CRUD
- Enrollment and progress tracking
- Certificate generation on course completion
- Reviews, wishlist, bookmarks, and notifications
- Student, instructor, and admin dashboards with Chart.js analytics
- Admin panel for managing users, courses, and categories
