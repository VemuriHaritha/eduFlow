import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';
import toast from 'react-hot-toast';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const load = () => {
    setLoading(true);
    api.get(`/courses/${id}`).then((res) => setData(res.data)).finally(() => setLoading(false));
    api.get(`/quizzes/${id}`).then((res) => setQuizzes(res.data)).catch(() => setQuizzes([]));
    api.get(`/assignments/${id}`).then((res) => setAssignments(res.data)).catch(() => setAssignments([]));
    if (user?.role === 'student') {
      api.get(`/enrollments/${id}/status`).then((res) => setEnrollment(res.data));
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login', { state: { from: `/courses/${id}` } });
    try {
      const res = await api.post(`/enrollments/${id}`);
      setEnrollment(res.data);
      toast.success('Enrolled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleWishlist = async () => {
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/wishlist', { courseId: id });
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleGetCertificate = async () => {
    try {
      const res = await api.post(`/certificates/${id}`);
      navigate(`/certificates/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate certificate');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      toast.success('Review submitted');
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <Loader full />;
  if (!data) return null;

  const { course, lessons, reviews } = data;
  const isEnrolled = Boolean(enrollment);
  const isStudent = user?.role === 'student';

  return (
    <div>
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <p className="text-primary-200 text-sm font-medium mb-2">{course.category?.name} • {course.difficulty}</p>
            <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
            <p className="text-primary-100 mb-4">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span>⭐ {course.rating?.toFixed(1)} ({course.numReviews} reviews)</span>
              <span>👥 {course.enrolledCount} students</span>
              <span>⏱ {course.duration}h</span>
              <span>🗣 {course.language}</span>
            </div>
            <p className="text-sm mt-3">Instructor: <Link to={`/`} className="underline">{course.instructor?.name}</Link></p>
          </div>

          <div className="card p-6 text-gray-900 dark:text-gray-100 h-fit">
            <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
              {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />}
            </div>
            <p className="text-3xl font-bold mb-4">{course.price > 0 ? `$${course.price}` : 'Free'}</p>

            {enrollment ? (
              <>
                <ProgressBar percent={enrollment.progressPercent} />
                <p className="text-xs text-gray-500 mt-2 mb-3">{enrollment.completedLessons?.length || 0}/{lessons.length} lessons completed</p>
                {lessons[0] && (
                  <Link to={`/lesson/${lessons[0]._id}`} className="btn-primary w-full">Continue Learning</Link>
                )}
                {enrollment.isCompleted && (
                  <button onClick={handleGetCertificate} className="btn-outline w-full mt-2">🎓 View Certificate</button>
                )}
              </>
            ) : (
              <button onClick={handleEnroll} className="btn-primary w-full">Enroll Now</button>
            )}
            {user?.role === 'student' && (
              <button onClick={handleWishlist} className="btn-outline w-full mt-2">
                {wishlisted ? '💔 Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            <div className="card divide-y divide-gray-100 dark:divide-gray-700">
              {lessons.map((l, idx) => (
                <div key={l._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center text-sm font-medium">{idx + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{l.title} <span className="text-xs ml-1">{l.contentType === 'pdf' ? '📄' : '📝'}</span></p>
                      <p className="text-xs text-gray-500">{l.duration} min read</p>
                    </div>
                  </div>
                  {enrollment && <span className="text-xs text-gray-400">{enrollment.completedLessons?.includes(l._id) ? '✅' : ''}</span>}
                </div>
              ))}
              {lessons.length === 0 && <p className="p-4 text-sm text-gray-500">No lessons added yet.</p>}
            </div>
          </section>

          {quizzes.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Quizzes</h2>
              <div className="space-y-3">
                {quizzes.map((q) => (
                  <QuizRow key={q._id} quiz={q} isEnrolled={isEnrolled} isStudent={isStudent} />
                ))}
              </div>
            </section>
          )}

          {assignments.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Assignments</h2>
              <div className="space-y-3">
                {assignments.map((a) => (
                  <AssignmentRow key={a._id} assignment={a} isEnrolled={isEnrolled} isStudent={isStudent} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            {enrollment && (
              <form onSubmit={submitReview} className="card p-4 mb-4 space-y-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })} className={`text-2xl ${n <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
                <textarea className="input" rows={3} placeholder="Share your experience..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                <button className="btn-primary" type="submit">Submit Review</button>
              </form>
            )}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{r.student?.name}</p>
                    <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                  {r.instructorReply && (
                    <div className="mt-2 pl-3 border-l-2 border-primary-300 text-sm text-gray-500">
                      <span className="font-medium">Instructor: </span>{r.instructorReply}
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
            </div>
          </section>
        </div>

        <div>
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {course.tags?.map((t) => <span key={t} className="badge bg-gray-100 dark:bg-gray-700">{t}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shows a quiz's basic info plus the student's best attempt (if any) and a
// "Take Quiz" / "Retake Quiz" action. Locked behind enrollment.
function QuizRow({ quiz, isEnrolled, isStudent }) {
  const [attempts, setAttempts] = useState(null);

  useEffect(() => {
    if (isEnrolled && isStudent) {
      api.get(`/quizzes/single/${quiz._id}/attempts`).then((res) => setAttempts(res.data)).catch(() => setAttempts([]));
    }
  }, [quiz._id, isEnrolled, isStudent]);

  const bestAttempt = attempts && attempts.length > 0
    ? attempts.reduce((best, a) => (a.percentage > best.percentage ? a : best), attempts[0])
    : null;
  const passed = bestAttempt && bestAttempt.percentage >= quiz.passingScore;

  return (
    <div className="card p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">🧠 {quiz.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{quiz.questions?.length || 0} questions • Passing score: {quiz.passingScore}%</p>
        {quiz.description && <p className="text-xs text-gray-500 mt-1">{quiz.description}</p>}
        {bestAttempt && (
          <p className={`text-xs mt-2 font-medium ${passed ? 'text-green-600' : 'text-amber-600'}`}>
            Best score: {bestAttempt.percentage}% {passed ? '✅ Passed' : '— not yet passed'}
          </p>
        )}
      </div>
      {isStudent ? (
        isEnrolled ? (
          <Link to={`/quiz/${quiz._id}`} className="btn-primary shrink-0 whitespace-nowrap">
            {bestAttempt ? 'Retake Quiz' : 'Take Quiz'}
          </Link>
        ) : (
          <span className="text-xs text-gray-400 shrink-0">Enroll to unlock</span>
        )
      ) : null}
    </div>
  );
}

// Shows an assignment's basic info plus the student's submission status.
function AssignmentRow({ assignment, isEnrolled, isStudent }) {
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    if (isEnrolled && isStudent) {
      api.get(`/assignments/single/${assignment._id}/my-submission`).then((res) => setSubmission(res.data)).catch(() => setSubmission(null));
    }
  }, [assignment._id, isEnrolled, isStudent]);

  const overdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="card p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">📝 {assignment.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Due: {new Date(assignment.dueDate).toLocaleString()} {overdue && !submission && <span className="text-red-500">(Overdue)</span>}
        </p>
        {submission && (
          <p className={`text-xs mt-2 font-medium ${submission.isGraded ? 'text-green-600' : 'text-amber-600'}`}>
            {submission.isGraded ? `Graded: ${submission.marks}/${assignment.maxMarks}` : 'Submitted — awaiting grading'}
          </p>
        )}
      </div>
      {isStudent ? (
        isEnrolled ? (
          <Link to={`/assignment/${assignment._id}`} className="btn-primary shrink-0 whitespace-nowrap">
            {submission ? 'View Submission' : 'Submit'}
          </Link>
        ) : (
          <span className="text-xs text-gray-400 shrink-0">Enroll to unlock</span>
        )
      ) : null}
    </div>
  );
}
