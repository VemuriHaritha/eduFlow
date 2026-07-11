import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import CourseCardSkeleton from '../components/CourseCardSkeleton';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/courses?sort=popular&limit=8'),
      api.get('/categories')
    ]).then(([c, cat]) => {
      setCourses(c.data.courses);
      setCategories(cat.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Learn without limits, grow without boundaries</h1>
            <p className="text-primary-100 text-lg mb-8">Master new skills with courses taught by real-world experts. Track your progress, earn certificates, and build your career.</p>
            <div className="flex gap-3">
              <Link to="/courses" className="btn bg-white text-primary-700 hover:bg-gray-100">Browse Courses</Link>
              <Link to="/register" className="btn border border-white/50 hover:bg-white/10">Become an Instructor</Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="w-72 h-72 rounded-full bg-white/10 flex items-center justify-center text-8xl">🎓</div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold mb-6">Explore Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link key={c._id} to={`/courses?category=${c._id}`} className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:text-primary-600 text-sm font-medium">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Popular Courses</h2>
          <Link to="/courses" className="text-primary-600 text-sm font-medium">View all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)
            : courses.map((c) => <CourseCard key={c._id} course={c} />)}
        </div>
        {!loading && courses.length === 0 && (
          <p className="text-center text-gray-500 py-10">No courses published yet. Check back soon!</p>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-6 text-center">
        <div className="card p-6">
          <p className="text-3xl font-bold text-primary-600 mb-1">100+</p>
          <p className="text-sm text-gray-500">Courses Available</p>
        </div>
        <div className="card p-6">
          <p className="text-3xl font-bold text-primary-600 mb-1">Expert</p>
          <p className="text-sm text-gray-500">Instructors</p>
        </div>
        <div className="card p-6">
          <p className="text-3xl font-bold text-primary-600 mb-1">Certified</p>
          <p className="text-sm text-gray-500">On Completion</p>
        </div>
      </section>
    </div>
  );
}
