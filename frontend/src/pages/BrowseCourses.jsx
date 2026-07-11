import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import CourseCardSkeleton from '../components/CourseCardSkeleton';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function BrowseCourses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const free = searchParams.get('free') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);
    if (free) params.set('free', free);
    params.set('sort', sort);
    params.set('page', page);
    params.set('limit', 12);

    api.get(`/courses?${params.toString()}`)
      .then((res) => {
        setCourses(res.data.courses);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [search, category, difficulty, free, sort, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', 1);
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Browse Courses</h1>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-6">
          <div>
            <label className="label">Search</label>
            <input
              className="input"
              defaultValue={search}
              placeholder="Search courses..."
              onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
              onBlur={(e) => updateParam('search', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => updateParam('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={difficulty} onChange={(e) => updateParam('difficulty', e.target.value)}>
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="label">Price</label>
            <select className="input" value={free} onChange={(e) => updateParam('free', e.target.value)}>
              <option value="">All</option>
              <option value="true">Free Only</option>
            </select>
          </div>
          <div>
            <label className="label">Sort By</label>
            <select className="input" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Students</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </aside>

        <div className="md:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : courses.map((c) => <CourseCard key={c._id} course={c} />)}
          </div>
          {!loading && courses.length === 0 && (
            <EmptyState icon="🔍" title="No courses found" description="Try adjusting your filters or search terms" />
          )}
          <Pagination page={page} pages={pages} onChange={(p) => updateParam('page', p)} />
        </div>
      </div>
    </div>
  );
}
