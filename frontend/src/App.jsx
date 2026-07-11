import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseCourses from './pages/BrowseCourses';
import CourseDetails from './pages/CourseDetails';
import LessonPlayer from './pages/LessonPlayer';
import Quiz from './pages/Quiz';
import Assignment from './pages/Assignment';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Certificate from './pages/Certificate';
import NotFound from './pages/NotFound';

import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorCourseForm from './pages/InstructorCourseForm';
import InstructorCourseManage from './pages/InstructorCourseManage';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('eduflow_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('eduflow_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<BrowseCourses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/certificates/:id" element={<Certificate />} />

          <Route path="/lesson/:id" element={<ProtectedRoute roles={['student']}><LessonPlayer /></ProtectedRoute>} />
          <Route path="/quiz/:id" element={<ProtectedRoute roles={['student']}><Quiz /></ProtectedRoute>} />
          <Route path="/assignment/:id" element={<ProtectedRoute roles={['student', 'instructor', 'admin']}><Assignment /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute roles={['student']}><Wishlist /></ProtectedRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />

          <Route path="/instructor/dashboard" element={<ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/courses/new" element={<ProtectedRoute roles={['instructor']}><InstructorCourseForm /></ProtectedRoute>} />
          <Route path="/instructor/courses/:id/edit" element={<ProtectedRoute roles={['instructor']}><InstructorCourseForm /></ProtectedRoute>} />
          <Route path="/instructor/courses/:id/manage" element={<ProtectedRoute roles={['instructor']}><InstructorCourseManage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/panel" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
