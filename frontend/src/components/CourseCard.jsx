import React from 'react';
import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course._id}`} className="card overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="h-40 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold opacity-30">
            {course.title?.[0]}
          </div>
        )}
        {course.price === 0 && <span className="absolute top-2 left-2 badge bg-green-500 text-white">Free</span>}
        {course.difficulty && <span className="absolute top-2 right-2 badge bg-black/50 text-white">{course.difficulty}</span>}
      </div>
      <div className="p-4">
        <p className="text-xs text-primary-600 font-medium mb-1">{course.category?.name}</p>
        <h3 className="font-semibold line-clamp-2 mb-1">{course.title}</h3>
        <p className="text-xs text-gray-500 mb-2">by {course.instructor?.name || 'Unknown'}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-amber-500">
            ⭐ <span className="text-gray-700 dark:text-gray-300">{course.rating?.toFixed?.(1) || '0.0'}</span>
            <span className="text-gray-400 text-xs">({course.numReviews || 0})</span>
          </div>
          <p className="font-bold">{course.price > 0 ? `$${course.price}` : 'Free'}</p>
        </div>
      </div>
    </Link>
  );
}
