import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function LessonPlayer() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const lessonRes = await api.get(`/lessons/single/${id}`);
      setLesson(lessonRes.data);
      const [lessonsRes, statusRes] = await Promise.all([
        api.get(`/lessons/${lessonRes.data.course}`),
        api.get(`/enrollments/${lessonRes.data.course}/status`)
      ]);
      setAllLessons(lessonsRes.data);
      setEnrollment(statusRes.data);
    } catch (err) {
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const markComplete = async () => {
    try {
      const res = await api.post(`/lessons/single/${id}/complete`);
      setEnrollment(res.data);
      toast.success('Lesson marked as complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not mark complete');
    }
  };

  const toggleBookmark = async () => {
    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setBookmarked(false);
      } else {
        await api.post('/bookmarks', { lessonId: id, courseId: lesson.course });
        setBookmarked(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Loader full />;
  if (!lesson) return null;

  const isComplete = enrollment?.completedLessons?.includes(id);
  const currentIndex = allLessons.findIndex((l) => l._id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
          {lesson.videoUrl ? (
            <video src={lesson.videoUrl} controls className="w-full h-full" />
          ) : (
            <p className="text-white/50">No video uploaded for this lesson</p>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{lesson.duration} minutes</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={toggleBookmark} className="btn-outline">{bookmarked ? '🔖 Bookmarked' : '📑 Bookmark'}</button>
              <button onClick={markComplete} disabled={isComplete} className="btn-primary">{isComplete ? '✅ Completed' : 'Mark Complete'}</button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">{lesson.description}</p>

          {lesson.pdfNotes && (
            <a href={lesson.pdfNotes} target="_blank" rel="noreferrer" className="btn-outline mt-4 inline-flex">📄 Download Notes</a>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          {currentIndex > 0 ? (
            <Link to={`/lesson/${allLessons[currentIndex - 1]._id}`} className="btn-outline">← Previous Lesson</Link>
          ) : <span />}
          {currentIndex < allLessons.length - 1 ? (
            <Link to={`/lesson/${allLessons[currentIndex + 1]._id}`} className="btn-primary">Next Lesson →</Link>
          ) : <span />}
        </div>
      </div>

      <div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Course Content</h3>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {allLessons.map((l, idx) => (
              <Link
                key={l._id}
                to={`/lesson/${l._id}`}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm ${l._id === id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">{idx + 1}</span>
                <span className="flex-1 line-clamp-1">{l.title}</span>
                {enrollment?.completedLessons?.includes(l._id) && <span>✅</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
