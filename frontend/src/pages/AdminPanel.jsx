import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const TABS = ['Users', 'Courses', 'Categories'];

export default function AdminPanel() {
  const [tab, setTab] = useState('Users');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>{t}</button>
        ))}
      </div>
      {tab === 'Users' && <UsersTab />}
      {tab === 'Courses' && <CoursesTab />}
      {tab === 'Categories' && <CategoriesTab />}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/admin/users${roleFilter ? `?role=${roleFilter}` : ''}`).then((res) => setUsers(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [roleFilter]);

  const toggleBlock = async (id) => {
    await api.put(`/admin/users/${id}/block`);
    toast.success('User status updated');
    load();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    await api.delete(`/admin/users/${id}`);
    toast.success('User deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-4">
        <select className="input w-48" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((u) => (
              <tr key={u._id}>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span className={`badge ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span>
                </td>
                <td className="p-3 flex gap-2">
                  {u.role !== 'admin' && (
                    <>
                      <button onClick={() => toggleBlock(u._id)} className="btn-outline px-3 py-1 text-xs">{u.isBlocked ? 'Unblock' : 'Block'}</button>
                      <button onClick={() => deleteUser(u._id)} className="btn-danger px-3 py-1 text-xs">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/courses').then((res) => setCourses(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/admin/courses/${id}`);
    toast.success('Course deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-left">
          <tr><th className="p-3">Title</th><th className="p-3">Instructor</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {courses.map((c) => (
            <tr key={c._id}>
              <td className="p-3">{c.title}</td>
              <td className="p-3">{c.instructor?.name}</td>
              <td className="p-3">{c.category?.name}</td>
              <td className="p-3"><span className={`badge ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.isPublished ? 'Published' : 'Draft'}</span></td>
              <td className="p-3"><button onClick={() => deleteCourse(c._id)} className="btn-danger px-3 py-1 text-xs">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/categories').then((res) => setCategories(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name });
      toast.success('Category added');
      setName('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Category deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2 max-w-sm">
        <input required placeholder="New category name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary" type="submit">Add</button>
      </form>
      <div className="card divide-y divide-gray-100 dark:divide-gray-700">
        {categories.map((c) => (
          <div key={c._id} className="p-3 flex items-center justify-between">
            <span className="text-sm">{c.name}</span>
            <button onClick={() => handleDelete(c._id)} className="btn-danger px-3 py-1 text-xs">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
