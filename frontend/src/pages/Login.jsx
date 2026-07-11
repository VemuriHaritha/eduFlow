import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirect = location.state?.from || (user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      student: { email: 'student@eduflow.com', password: 'password123' },
      instructor: { email: 'instructor@eduflow.com', password: 'password123' },
      admin: { email: 'admin@eduflow.com', password: 'password123' }
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Login to continue learning</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Login'}</button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 mb-2 text-center">Try a demo account</p>
          <div className="flex gap-2 justify-center text-xs">
            <button onClick={() => fillDemo('student')} className="btn-outline px-3 py-1.5">Student</button>
            <button onClick={() => fillDemo('instructor')} className="btn-outline px-3 py-1.5">Instructor</button>
            <button onClick={() => fillDemo('admin')} className="btn-outline px-3 py-1.5">Admin</button>
          </div>
        </div>

        <p className="text-sm text-center mt-6 text-gray-500">
          Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
