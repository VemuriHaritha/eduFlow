import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/quizzes/single/${id}`).then((res) => setQuiz(res.data)).finally(() => setLoading(false));
  }, [id]);

  const toggleOption = (questionId, optionId, type) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (type === 'MultipleSelect') {
        const next = current.includes(optionId) ? current.filter((o) => o !== optionId) : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: quiz.questions.map((q) => ({
          question: q._id,
          selectedOptionIds: answers[q._id] || []
        }))
      };
      const res = await api.post(`/quizzes/single/${id}/attempt`, payload);
      setResult(res.data);
      toast.success('Quiz submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader full />;
  if (!quiz) return null;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">{result.percentage >= quiz.passingScore ? '🎉' : '📘'}</div>
        <h1 className="text-2xl font-bold mb-2">Quiz Results</h1>
        <p className="text-gray-500 mb-8">{quiz.title}</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-4"><p className="text-2xl font-bold text-primary-600">{result.percentage}%</p><p className="text-xs text-gray-500">Score</p></div>
          <div className="card p-4"><p className="text-2xl font-bold text-green-600">{result.correctCount}</p><p className="text-xs text-gray-500">Correct</p></div>
          <div className="card p-4"><p className="text-2xl font-bold text-red-500">{result.wrongCount}</p><p className="text-xs text-gray-500">Wrong</p></div>
        </div>
        <button onClick={() => navigate(-1)} className="btn-primary">Back to Course</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">{quiz.title}</h1>
      <p className="text-gray-500 mb-8">{quiz.description}</p>

      <div className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q._id} className="card p-5">
            <p className="font-medium mb-3">{idx + 1}. {q.questionText}</p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm">
                  <input
                    type={q.type === 'MultipleSelect' ? 'checkbox' : 'radio'}
                    name={q._id}
                    checked={(answers[q._id] || []).includes(opt._id)}
                    onChange={() => toggleOption(q._id, opt._id, q.type)}
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full mt-8">
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
}
