import React from 'react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const items = [];
  for (let i = 1; i <= pages; i++) items.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn-outline px-3 py-1.5 text-sm">Prev</button>
      {items.map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`w-9 h-9 rounded-lg text-sm font-medium ${i === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          {i}
        </button>
      ))}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="btn-outline px-3 py-1.5 text-sm">Next</button>
    </div>
  );
}
