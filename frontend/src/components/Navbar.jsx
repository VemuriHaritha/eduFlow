import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');
  const ref = useRef();

  useEffect(() => {
    if (user) {
      api.get('/notifications').then((res) => setNotifications(res.data)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor/dashboard' : '/dashboard';

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses?search=${encodeURIComponent(search)}`);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center text-sm">EF</span>
          EduFlow
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, instructors, tags..."
            className="input rounded-r-none"
          />
          <button className="btn-primary rounded-l-none" type="submit">Search</button>
        </form>

        <div className="flex items-center gap-3">
          <Link to="/courses" className="hidden sm:inline text-sm font-medium hover:text-primary-600">Browse Courses</Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <div className="relative" ref={ref}>
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 card p-2 max-h-96 overflow-y-auto">
                    <p className="text-sm font-semibold px-2 py-1">Notifications</p>
                    {notifications.length === 0 && <p className="text-sm text-gray-500 px-2 py-4 text-center">No notifications yet</p>}
                    {notifications.slice(0, 10).map((n) => (
                      <div key={n._id} className={`px-2 py-2 rounded-lg text-sm ${!n.isRead ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-gray-500 text-xs">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                  <img src={user.photo ? user.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 card p-2" onMouseLeave={() => setMenuOpen(false)}>
                    <p className="px-2 py-1 text-sm font-semibold truncate">{user.name}</p>
                    <p className="px-2 pb-2 text-xs text-gray-500 capitalize">{user.role}</p>
                    <Link to={dashboardPath} className="block px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    <Link to="/profile" className="block px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(false)}>Profile</Link>
                    {user.role === 'student' && <Link to="/wishlist" className="block px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(false)}>Wishlist</Link>}
                    <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500">Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
