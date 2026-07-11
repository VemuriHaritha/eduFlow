import React from 'react';

export default function Loader({ full }) {
  return (
    <div className={full ? 'min-h-[60vh] flex items-center justify-center' : 'flex items-center justify-center py-10'}>
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}
