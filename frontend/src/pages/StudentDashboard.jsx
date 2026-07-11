import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/student'),
      api.get('/enrollments/mine')
    ]).then(([s, e]) => {
      setStats(s.data);
      setEnrollments(e.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  const chartData = {
    labels: stats.progressData.map((p) => p.course?.slice(0, 12) || 'Course'),
    datasets: [{
      label: 'Progress %',
      data: stats.progressData.map((p) => p.progress),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79,70,229,0.1)',
      tension: 0.3,
      fill: true
    }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500">Here's your learning summary</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Enrolled Courses" value={stats.enrolledCourses} icon="📚" />
        <StatCard label="Completed" value={stats.completedCourses} icon="✅" color="text-green-600" />
        <StatCard label="Pending Assignments" value={stats.pendingAssignments} icon="📝" color="text-amber-600" />
        <StatCard label="Upcoming Quizzes" value={stats.upcomingQuizzes} icon="🧠" />
        <StatCard label="Average Score" value={`${stats.averageScore}%`} icon="🎯" color="text-primary-600" />
      </div>

      {stats.progressData.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Progress Overview</h2>
          <Line data={chartData} options={{ responsive: true, scales: { y: { min: 0, max: 100 } } }} />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Continue Learning</h2>
          <Link to="/courses" className="text-primary-600 text-sm font-medium">Browse more →</Link>
        </div>
        {enrollments.length === 0 ? (
          <EmptyState icon="🎓" title="No courses yet" description="Enroll in a course to get started on your learning journey." action={<Link to="/courses" className="btn-primary">Browse Courses</Link>} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {enrollments.map((e) => e.course && (
              <div key={e._id} className="card p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 shrink-0 overflow-hidden">
                  {e.course.thumbnail && <img src={e.course.thumbnail} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{e.course.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{e.course.instructor?.name}</p>
                  <ProgressBar percent={e.progressPercent} />
                  <Link to={`/courses/${e.course._id}`} className="text-primary-600 text-xs font-medium mt-1 inline-block">Continue →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
