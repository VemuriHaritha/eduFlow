import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function Assignment() {
  const { id } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState({});

  const load = async () => {
    setLoading(true);
    const res = await api.get(`/assignments/single/${id}`);
    setAssignment(res.data);
    if (user.role === 'student') {
      const sub = await api.get(`/assignments/single/${id}/my-submission`);
      setMySubmission(sub.data);
    } else {
      const subs = await api.get(`/assignments/single/${id}/submissions`);
      setSubmissions(subs.data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    const formData = new FormData();
    formData.append('submission', file);
    try {
      await api.post(`/assignments/single/${id}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Assignment submitted!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleGrade = async (submissionId) => {
    const g = grading[submissionId];
    if (!g?.marks) return toast.error('Enter marks');
    try {
      await api.put(`/assignments/submissions/${submissionId}/grade`, g);
      toast.success('Graded successfully');
      load();
    } catch (err) {
      toast.error('Grading failed');
    }
  };

  if (loading) return <Loader full />;
  if (!assignment) return null;

  const overdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">{assignment.title}</h1>
      <p className="text-sm text-gray-500 mb-4">Due: {new Date(assignment.dueDate).toLocaleString()} {overdue && <span className="text-red-500">(Overdue)</span>}</p>
      <p className="text-gray-600 dark:text-gray-300 mb-8">{assignment.description}</p>
      <p className="text-sm text-gray-500 mb-8">Max Marks: {assignment.maxMarks}</p>

      {user.role === 'student' ? (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Your Submission</h3>
          {mySubmission ? (
            <div className="space-y-2">
              <p className="text-sm">📎 {mySubmission.fileName}</p>
              <p className="text-xs text-gray-500">Submitted: {new Date(mySubmission.submittedAt).toLocaleString()}</p>
              {mySubmission.isGraded ? (
                <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="font-medium text-sm">Marks: {mySubmission.marks}/{assignment.maxMarks}</p>
                  {mySubmission.remarks && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Feedback: {mySubmission.remarks}</p>}
                </div>
              ) : <p className="text-sm text-amber-600">Awaiting grading</p>}
              <p className="text-xs text-gray-500 mt-3">Resubmit below to replace your submission (before grading)</p>
            </div>
          ) : <p className="text-sm text-gray-500 mb-4">You haven't submitted this assignment yet.</p>}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input type="file" accept=".pdf,.docx,.zip" onChange={(e) => setFile(e.target.files[0])} className="input" />
            <button type="submit" className="btn-primary">Submit Assignment</button>
          </form>
        </div>
      ) : (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Student Submissions ({submissions.length})</h3>
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s._id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{s.student?.name}</p>
                  <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-primary-600 text-xs">Download</a>
                </div>
                {s.isGraded ? (
                  <p className="text-sm text-green-600">Graded: {s.marks}/{assignment.maxMarks}</p>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <input type="number" placeholder="Marks" className="input w-24" onChange={(e) => setGrading({ ...grading, [s._id]: { ...grading[s._id], marks: e.target.value } })} />
                    <input placeholder="Remarks" className="input flex-1" onChange={(e) => setGrading({ ...grading, [s._id]: { ...grading[s._id], remarks: e.target.value } })} />
                    <button onClick={() => handleGrade(s._id)} className="btn-primary">Grade</button>
                  </div>
                )}
              </div>
            ))}
            {submissions.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
