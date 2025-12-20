import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import toast from 'react-hot-toast';

const allATSPage = () => {
  const { user } = useAuth();
  const [jobDesc, setJobDesc] = useState('');
  const [jobDomain, setJobDomain] = useState('');
  const [allResults, setAllResults] = useState([]);
  const [myResult, setMyResult] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);

  const handleAllSubmit = async (e) => {
    e.preventDefault();
    setLoadingAll(true);
    setAllResults([]);
    try {
      const res = await api.post('/all-ats', {
        job_desc: jobDesc,
        job_domain: jobDomain
      });
      setAllResults(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching ATS scores for all students');
    } finally {
      setLoadingAll(false);
    }
  };

  const handleMySubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      toast.error('You must be logged in to get your ATS score');
      return;
    }
    setLoadingMine(true);
    setMyResult(null);
    try {
      const res = await api.post('/student-ats', {
        student_id: user._id,
        job_desc: jobDesc,
        job_domain: jobDomain
      });
      setMyResult(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching your ATS score');
    } finally {
      setLoadingMine(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">ATS Scoring</h1>

        {/* Job Inputs */}
        <form className="space-y-4" onSubmit={handleAllSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              rows={6}
              className="w-full border rounded-md p-2"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              required
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
              required
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              disabled={loadingAll}
            >
              {loadingAll ? 'Processing...' : 'Get ATS Scores (All Students)'}
            </button>

            <button
              type="button"
              onClick={handleMySubmit}
              className="btn btn-secondary px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              disabled={loadingMine}
            >
              {loadingMine ? 'Processing...' : 'Get My ATS Score'}
            </button>
          </div>
        </form>

        {/* Loading Indicators */}
        {loadingAll && <LoadingSpinner size="large" />}
        {loadingMine && <LoadingSpinner size="large" />}

        {/* My Score */}
        {myResult && (
          <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">My ATS Score</h2>
            <p><strong>Name:</strong> {myResult.name}</p>
            <p><strong>Email:</strong> {myResult.email}</p>
            <p><strong>Skills:</strong> {myResult.skills?.join(', ') || 'N/A'}</p>
            <p className="text-lg mt-2">
              <strong>ATS Score:</strong> {myResult.ats_score}%
            </p>
          </div>
        )}

        {/* All Results */}
        {allResults.length > 0 && (
          <div className="overflow-x-auto mt-8">
            <h2 className="text-xl font-semibold mb-2">All Students</h2>
            <table className="min-w-full border divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Skills</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ATS Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allResults.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{r.name}</td>
                    <td className="px-4 py-2">{r.email}</td>
                    <td className="px-4 py-2">{Array.isArray(r.skills) ? r.skills.join(', ') : ''}</td>
                    <td className="px-4 py-2">{r.ats_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default allATSPage;
