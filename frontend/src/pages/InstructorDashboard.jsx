import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/instructor'),
      api.get('/courses/instructor/mine')
    ]).then(([s, c]) => {
      setStats(s.data);
      setCourses(c.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (id) => {
    try {
      await api.put(`/courses/${id}/publish`);
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course permanently?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  if (loading) return <Loader full />;

  const chartData = {
    labels: stats.studentsPerCourse.map((s) => s.course?.slice(0, 15)),
    datasets: [{ label: 'Students Enrolled', data: stats.studentsPerCourse.map((s) => s.students), backgroundColor: '#6366f1', borderRadius: 6 }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name.split(' ')[0]}</p>
        </div>
        <Link to="/instructor/courses/new" className="btn-primary">+ Create Course</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Courses" value={stats.totalCourses} icon="📚" />
        <StatCard label="Total Students" value={stats.totalStudents} icon="👥" color="text-green-600" />
        <StatCard label="Assignments Submitted" value={stats.assignmentsSubmitted} icon="📝" />
        <StatCard label="Revenue" value={`$${stats.revenue}`} icon="💰" color="text-amber-600" />
        <StatCard label="Avg Rating" value={stats.averageRating} icon="⭐" />
      </div>

      {stats.studentsPerCourse.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Students per Course</h2>
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <EmptyState icon="📚" title="No courses yet" description="Create your first course to start teaching." action={<Link to="/instructor/courses/new" className="btn-primary">Create Course</Link>} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <div key={c._id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.isPublished ? 'Published' : 'Draft'}</span>
                  <span className="text-xs text-gray-500">{c.enrolledCount} students</span>
                </div>
                <h3 className="font-semibold mb-1 line-clamp-1">{c.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{c.category?.name}</p>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/instructor/courses/${c._id}/manage`} className="btn-outline px-3 py-1.5 text-xs">Manage</Link>
                  <Link to={`/instructor/courses/${c._id}/edit`} className="btn-outline px-3 py-1.5 text-xs">Edit</Link>
                  <button onClick={() => togglePublish(c._id)} className="btn-outline px-3 py-1.5 text-xs">{c.isPublished ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => deleteCourse(c._id)} className="btn-danger px-3 py-1.5 text-xs">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
