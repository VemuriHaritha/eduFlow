import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUserLocal } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    phone: user.phone || '',
    education: user.education || '',
    experience: user.experience || '',
    specialization: user.specialization || '',
    qualifications: user.qualifications || ''
  });
  const [photo, setPhoto] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (photo) formData.append('photo', photo);
      const res = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUserLocal(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/change-password', pwForm);
      toast.success('Password updated');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-4">
        <img src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`} className="w-20 h-20 rounded-full object-cover" alt="" />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500 capitalize">{user.role} • {user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Edit Profile</h2>
        <div>
          <label className="label">Profile Photo</label>
          <input type="file" accept="image/*" className="input" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        {user.role === 'student' && (
          <div>
            <label className="label">Education</label>
            <input className="input" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          </div>
        )}
        {user.role === 'instructor' && (
          <>
            <div>
              <label className="label">Experience</label>
              <input className="input" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            </div>
            <div>
              <label className="label">Specialization</label>
              <input className="input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            </div>
            <div>
              <label className="label">Qualifications</label>
              <input className="input" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
            </div>
          </>
        )}
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>

      <form onSubmit={handlePasswordChange} className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Change Password</h2>
        <div>
          <label className="label">Current Password</label>
          <input type="password" className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" className="input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
        </div>
        <button type="submit" className="btn-outline">Update Password</button>
      </form>
    </div>
  );
}
