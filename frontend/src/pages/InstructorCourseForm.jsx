import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

export default function InstructorCourseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: '', difficulty: 'Beginner',
    duration: '', price: 0, language: 'English', tags: ''
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
    if (isEdit) {
      api.get(`/courses/${id}`).then((res) => {
        const c = res.data.course;
        setForm({
          title: c.title, description: c.description, category: c.category._id,
          difficulty: c.difficulty, duration: c.duration, price: c.price,
          language: c.language, tags: c.tags.join(', ')
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (thumbnail) formData.append('thumbnail', thumbnail);

      if (isEdit) {
        await api.put(`/courses/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Course updated');
        navigate(`/instructor/courses/${id}/manage`);
      } else {
        const res = await api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Course created! Now add lessons.');
        navigate(`/instructor/courses/${res.data._id}/manage`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Course' : 'Create New Course'}</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Title</label>
          <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea required rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select required className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="label">Duration (hours)</label>
            <input type="number" className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <div>
            <label className="label">Price ($, 0 = free)</label>
            <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Language</label>
            <input className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
          </div>
          <div>
            <label className="label">Thumbnail</label>
            <input type="file" accept="image/*" className="input" onChange={(e) => setThumbnail(e.target.files[0])} />
          </div>
        </div>
        <div>
          <label className="label">Tags (comma separated)</label>
          <input className="input" placeholder="React, JavaScript, Web Dev" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}</button>
      </form>
    </div>
  );
}
