import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 font-bold text-xl text-primary-600 mb-3">
            <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center text-sm">EF</span>
            EduFlow
          </div>
          <p className="text-sm text-gray-500 max-w-sm">Learn new skills, earn certificates, and grow your career with courses taught by industry experts.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Platform</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link to="/courses" className="hover:text-primary-600">Browse Courses</Link></li>
            <li><Link to="/register" className="hover:text-primary-600">Become an Instructor</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>About</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} EduFlow. All rights reserved.
      </div>
    </footer>
  );
}
