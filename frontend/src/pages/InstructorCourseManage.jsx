import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const TABS = ['Lessons', 'Quizzes', 'Assignments', 'Students'];

export default function InstructorCourseManage() {
  const { id } = useParams();
  const [tab, setTab] = useState('Lessons');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${id}`).then((res) => setCourse(res.data.course)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader full />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">{course?.title}</h1>
      <p className="text-gray-500 mb-6">Manage lessons, quizzes, assignments, and view enrolled students</p>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Lessons' && <LessonsTab courseId={id} />}
      {tab === 'Quizzes' && <QuizzesTab courseId={id} />}
      {tab === 'Assignments' && <AssignmentsTab courseId={id} />}
      {tab === 'Students' && <StudentsTab courseId={id} />}
    </div>
  );
}

function LessonsTab({ courseId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', duration: '', order: '' });
  const [video, setVideo] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/lessons/${courseId}`).then((res) => setLessons(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [courseId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (video) formData.append('video', video);
      if (pdf) formData.append('pdfNotes', pdf);
      await api.post(`/lessons/${courseId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Lesson added');
      setForm({ title: '', description: '', duration: '', order: '' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error('Failed to add lesson');
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    await api.delete(`/lessons/single/${lessonId}`);
    toast.success('Lesson deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Add Lesson'}</button>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-4 space-y-3">
          <input required placeholder="Title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Description" className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Duration (min)" className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <input type="number" placeholder="Order" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div>
            <label className="label">Video File</label>
            <input type="file" accept="video/*" className="input" onChange={(e) => setVideo(e.target.files[0])} />
          </div>
          <div>
            <label className="label">PDF Notes</label>
            <input type="file" accept="application/pdf" className="input" onChange={(e) => setPdf(e.target.files[0])} />
          </div>
          <button type="submit" className="btn-primary">Save Lesson</button>
        </form>
      )}

      <div className="card divide-y divide-gray-100 dark:divide-gray-700">
        {lessons.map((l, idx) => (
          <div key={l._id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{idx + 1}. {l.title}</p>
              <p className="text-xs text-gray-500">{l.duration} min</p>
            </div>
            <button onClick={() => handleDelete(l._id)} className="btn-danger px-3 py-1.5 text-xs">Delete</button>
          </div>
        ))}
        {lessons.length === 0 && <p className="p-4 text-sm text-gray-500">No lessons yet.</p>}
      </div>
    </div>
  );
}

function QuizzesTab({ courseId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(50);
  const [questions, setQuestions] = useState([
    { questionText: '', type: 'MCQ', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
  ]);

  const load = () => {
    setLoading(true);
    api.get(`/quizzes/${courseId}`).then((res) => setQuizzes(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [courseId]);

  const addQuestion = () => setQuestions([...questions, { questionText: '', type: 'MCQ', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
  const updateQuestion = (idx, field, value) => {
    const next = [...questions];
    next[idx][field] = value;
    setQuestions(next);
  };
  const updateOption = (qIdx, oIdx, field, value) => {
    const next = [...questions];
    if (field === 'isCorrect' && next[qIdx].type !== 'MultipleSelect') {
      next[qIdx].options.forEach((o, i) => { o.isCorrect = i === oIdx; });
    } else {
      next[qIdx].options[oIdx][field] = value;
    }
    setQuestions(next);
  };
  const addOption = (qIdx) => {
    const next = [...questions];
    next[qIdx].options.push({ text: '', isCorrect: false });
    setQuestions(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/quizzes/${courseId}`, { title, description, passingScore, questions });
      toast.success('Quiz created');
      setShowForm(false);
      setTitle(''); setDescription('');
      setQuestions([{ questionText: '', type: 'MCQ', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
      load();
    } catch (err) {
      toast.error('Failed to create quiz');
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    await api.delete(`/quizzes/single/${quizId}`);
    toast.success('Quiz deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Create Quiz'}</button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4">
          <input required placeholder="Quiz Title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="Description" className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div>
            <label className="label">Passing Score (%)</label>
            <input type="number" className="input w-32" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input required placeholder={`Question ${qIdx + 1}`} className="input flex-1" value={q.questionText} onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)} />
                <select className="input w-40" value={q.type} onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}>
                  <option value="MCQ">MCQ</option>
                  <option value="TrueFalse">True/False</option>
                  <option value="MultipleSelect">Multiple Select</option>
                </select>
              </div>
              {q.options.map((o, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2 pl-4">
                  <input type={q.type === 'MultipleSelect' ? 'checkbox' : 'radio'} checked={o.isCorrect} onChange={(e) => updateOption(qIdx, oIdx, 'isCorrect', e.target.checked)} />
                  <input required placeholder={`Option ${oIdx + 1}`} className="input" value={o.text} onChange={(e) => updateOption(qIdx, oIdx, 'text', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={() => addOption(qIdx)} className="text-primary-600 text-xs pl-4">+ Add Option</button>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="btn-outline">+ Add Question</button>
          <button type="submit" className="btn-primary w-full">Save Quiz</button>
        </form>
      )}

      <div className="card divide-y divide-gray-100 dark:divide-gray-700">
        {quizzes.map((q) => (
          <div key={q._id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{q.title}</p>
              <p className="text-xs text-gray-500">{q.questions.length} questions</p>
            </div>
            <button onClick={() => handleDelete(q._id)} className="btn-danger px-3 py-1.5 text-xs">Delete</button>
          </div>
        ))}
        {quizzes.length === 0 && <p className="p-4 text-sm text-gray-500">No quizzes yet.</p>}
      </div>
    </div>
  );
}

function AssignmentsTab({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxMarks: 100 });

  const load = () => {
    setLoading(true);
    api.get(`/assignments/${courseId}`).then((res) => setAssignments(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/assignments/${courseId}`, form);
      toast.success('Assignment created');
      setShowForm(false);
      setForm({ title: '', description: '', dueDate: '', maxMarks: 100 });
      load();
    } catch (err) {
      toast.error('Failed to create assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    await api.delete(`/assignments/single/${id}`);
    toast.success('Assignment deleted');
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Create Assignment'}</button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <input required placeholder="Title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea required placeholder="Description" className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input required type="datetime-local" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Max Marks</label>
              <input type="number" className="input" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Assignment</button>
        </form>
      )}

      <div className="card divide-y divide-gray-100 dark:divide-gray-700">
        {assignments.map((a) => (
          <div key={a._id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{a.title}</p>
              <p className="text-xs text-gray-500">Due: {new Date(a.dueDate).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <a href={`/assignment/${a._id}`} className="btn-outline px-3 py-1.5 text-xs">View Submissions</a>
              <button onClick={() => handleDelete(a._id)} className="btn-danger px-3 py-1.5 text-xs">Delete</button>
            </div>
          </div>
        ))}
        {assignments.length === 0 && <p className="p-4 text-sm text-gray-500">No assignments yet.</p>}
      </div>
    </div>
  );
}

function StudentsTab({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${courseId}/students`).then((res) => setStudents(res.data)).finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <Loader />;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-left">
          <tr>
            <th className="p-3">Student</th>
            <th className="p-3">Email</th>
            <th className="p-3">Progress</th>
            <th className="p-3">Enrolled On</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {students.map((s) => (
            <tr key={s._id}>
              <td className="p-3">{s.student?.name}</td>
              <td className="p-3">{s.student?.email}</td>
              <td className="p-3">{s.progressPercent}%</td>
              <td className="p-3">{new Date(s.enrolledAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {students.length === 0 && <p className="p-4 text-sm text-gray-500">No students enrolled yet.</p>}
    </div>
  );
}
