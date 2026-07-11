import React from 'react';

export default function ProgressBar({ percent = 0, showLabel = true, color = 'bg-primary-600' }) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="w-full">
      <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${p}%` }} />
      </div>
      {showLabel && <p className="text-xs text-gray-500 mt-1">{p}% complete</p>}
    </div>
  );
}
