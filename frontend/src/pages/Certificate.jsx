import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function Certificate() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/certificates/${id}`).then((res) => setCert(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader full />;
  if (!cert) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="border-8 border-primary-600 rounded-2xl p-12 text-center bg-white dark:bg-gray-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary-50 dark:bg-primary-900/30 rounded-full -translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-50 dark:bg-primary-900/30 rounded-full translate-x-20 translate-y-20" />
        <p className="text-primary-600 font-semibold tracking-widest text-sm mb-6">CERTIFICATE OF COMPLETION</p>
        <p className="text-gray-500 mb-2">This is to certify that</p>
        <h1 className="text-4xl font-bold mb-4 font-serif">{cert.student?.name}</h1>
        <p className="text-gray-500 mb-2">has successfully completed the course</p>
        <h2 className="text-2xl font-semibold mb-6 text-primary-700">{cert.course?.title}</h2>
        <div className="flex justify-center gap-16 text-sm text-gray-500 mb-8">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{cert.course?.instructor?.name}</p>
            <p>Instructor</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{new Date(cert.completionDate).toLocaleDateString()}</p>
            <p>Completion Date</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">Certificate ID: {cert.certificateId}</p>
      </div>
      <div className="text-center mt-6">
        <button onClick={() => window.print()} className="btn-primary">🖨 Print Certificate</button>
      </div>
    </div>
  );
}
