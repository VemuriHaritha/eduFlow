import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/admin').then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  const catData = {
    labels: stats.categoryDistribution.map((c) => c.category),
    datasets: [{ data: stats.categoryDistribution.map((c) => c.count), backgroundColor: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'] }]
  };

  const popData = {
    labels: stats.coursesByPopularity.map((c) => c.title?.slice(0, 15)),
    datasets: [{ label: 'Enrollments', data: stats.coursesByPopularity.map((c) => c.enrolledCount), backgroundColor: '#4f46e5', borderRadius: 6 }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link to="/admin/panel" className="btn-primary">Manage Users & Courses</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.totalStudents} icon="🎓" />
        <StatCard label="Total Instructors" value={stats.totalInstructors} icon="👨‍🏫" color="text-green-600" />
        <StatCard label="Total Courses" value={stats.totalCourses} icon="📚" />
        <StatCard label="Active Users" value={stats.activeUsers} icon="✅" color="text-primary-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Course Category Distribution</h2>
          {stats.categoryDistribution.length > 0 ? <Doughnut data={catData} /> : <p className="text-sm text-gray-500">No data yet</p>}
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Most Popular Courses</h2>
          {stats.coursesByPopularity.length > 0 ? <Bar data={popData} /> : <p className="text-sm text-gray-500">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
