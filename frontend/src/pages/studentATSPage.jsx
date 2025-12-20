import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentATSPage = () => {
  const { user } = useAuth();
  const [jobDesc, setJobDesc] = useState('');
  const [jobDomain, setJobDomain] = useState('');

  // Mutation to fetch ATS score for this student
  const { mutate, data, isLoading } = useMutation({
    mutationFn: (payload) => api.post('/student-ats', payload).then(res => res.data),
    onError: () => toast.error('Failed to fetch ATS score'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobDesc || !jobDomain) {
      toast.error('Please provide job description and domain');
      return;
    }
    mutate({
      student_id: user?._id,
      job_desc: jobDesc,
      job_domain: jobDomain,
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My ATS Score</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              className="w-full border rounded-md p-2"
              rows="4"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste job description here"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Domain
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={jobDomain}
              onChange={(e) => setJobDomain(e.target.value)}
              placeholder="e.g. Data Science"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Get My ATS Score'}
          </button>
        </form>

        {isLoading && <LoadingSpinner size="large" />}

        {data && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Result</h2>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Skills:</strong> {data.skills?.join(', ') || 'N/A'}</p>
            <p className="text-lg mt-2">
              <strong>ATS Score:</strong> {data.ats_score}%
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentATSPage;
