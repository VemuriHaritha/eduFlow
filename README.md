# 🎓 EduFlow — Learning Management System

A full-stack MERN Learning Management System where instructors create and manage courses, and students enroll, learn, take quizzes, submit assignments, and earn certificates.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![React](https://img.shields.io/badge/react-18.3-61DAFB.svg)
![MongoDB](https://img.shields.io/badge/mongodb-8.5-47A248.svg)

---

## ✨ Features

**Authentication & Roles**
- JWT authentication with bcrypt password hashing
- Three roles: Student, Instructor, Admin — each with a dedicated dashboard
- Protected routes and role-based access control
- Block / unblock users (admin)

**Courses**
- Full CRUD with thumbnails, categories, tags, difficulty, and pricing
- Publish / unpublish workflow (draft → live)
- Search, filter (category, difficulty, price, language), sort, and pagination

**Lessons**
- Video and PDF notes per lesson, with attachments
- Lesson ordering and "mark as complete" progress tracking

**Quizzes**
- MCQ, True/False, and Multiple-Select question types
- Auto-graded attempts with score, percentage, and correct/wrong breakdown
- Full attempt history per student

**Assignments**
- File submissions (PDF / DOCX / ZIP)
- Instructor grading with marks + written remarks
- Resubmission supported before grading

**Progress & Certificates**
- Per-course completion percentage
- Auto-eligible, printable HTML certificate once a course reaches 100%

**Engagement**
- Reviews (enrolled students only) with instructor replies
- Course wishlist and lesson bookmarks
- In-app notification center

**Dashboards & Analytics**
- Student: enrolled/completed courses, pending work, average score, progress chart
- Instructor: course/student counts, revenue, ratings, enrollment chart
- Admin: platform totals, category distribution, most popular courses — all via Chart.js

**Admin Panel**
- Manage users (block / delete), manage courses, manage categories

**UI**
- Tailwind CSS, dark mode, responsive layout, skeleton loading states, toast notifications

---

## 📸 Screenshots

| Home | Course Details | Student Dashboard |
|---|---|---|
| ![Home](docs/screenshots/home.png) | ![Course Details](docs/screenshots/course-details.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Lesson Player | Quiz | Admin Panel |
|---|---|---|
| ![Lesson Player](docs/screenshots/lesson-player.png) | ![Quiz](docs/screenshots/quiz.png) | ![Admin Panel](docs/screenshots/admin-panel.png) |

---

## 🚀 Live Demo

| | URL |
|---|---|
| **Frontend** | https://eduflow-frontend-zkjx.onrender.com |
| **Backend API** | https://eduflow-backend-2ztt.onrender.com/api/health |

> Hosted on Render's free tier — the backend spins down after inactivity, so the first request after idle time can take 30–50 seconds to wake up.

### Demo Login

| Role | Email | Password |
|---|---|---|
| Admin | `admin@eduflow.com` | `password123` |
| Instructor | `instructor@eduflow.com` | `password123` |
| Student | `student@eduflow.com` | `password123` |

Seeded via `npm run seed` in the backend.

---

## 🛠 Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- React Router
- Axios
- Chart.js / react-chartjs-2
- react-hot-toast

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs
- Multer (file uploads)

**Deployment**
- Backend: Render Web Service
- Frontend: Render Static Site
- Database: MongoDB Atlas

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/eduflow.git
cd eduflow
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI, JWT secret, and client URL
npm install
npm run seed      # optional — creates demo admin/instructor/student + sample course
npm run dev        # runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# leave VITE_API_URL empty for local dev (uses the Vite proxy to localhost:5000)
npm install
npm run dev         # runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### 4. Production build

```bash
cd frontend
npm run build        # outputs static files to frontend/dist
```

---

## 🔑 Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/eduflow` |
| `JWT_SECRET` | Secret used to sign JWTs | a long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Frontend origin, for CORS | `https://eduflow-frontend-zkjx.onrender.com` |

### `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the deployed backend. Leave empty for local dev (uses Vite's dev proxy). | `https://eduflow-backend-2ztt.onrender.com` |

See `.env.example` in each folder for the full template.
---

## 🔮 Future Improvements

- [ ] Move file storage to Cloudinary / S3 for persistence across deploys
- [ ] Email verification and password reset flow
- [ ] Server-side pagination on admin user/course tables
- [ ] Rate limiting and Helmet for production hardening
- [ ] Rich-text lesson editor as an alternative to video
- [ ] Automated tests (Jest / React Testing Library)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Payment integration for paid courses

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines.


---

## 📁 Folder Structure
