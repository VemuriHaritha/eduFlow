import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then((res) => setItems(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <EmptyState icon="🤍" title="Your wishlist is empty" description="Save courses you're interested in to revisit them later." action={<Link to="/courses" className="btn-primary">Browse Courses</Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((i) => i.course && <CourseCard key={i._id} course={i.course} />)}
        </div>
      )}
    </div>
  );
}
