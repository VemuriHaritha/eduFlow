import React from 'react';

export default function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-40 skeleton rounded-none" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="h-4 w-2/3 skeleton" />
      </div>
    </div>
  );
}
