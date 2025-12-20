// pages/JobsPage.jsx
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Plus, Filter, Search } from 'lucide-react'
import Layout from '../components/common/Layout'
import JobCard from '../components/jobs/JobCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'
import { useAuth } from '../context/AuthContext'
import { jobService } from '../services/jobs'
import toast from 'react-hot-toast'

const JobsPage = () => {
  const navigate = useNavigate()
  const { user, isStudent } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    targetAudience: '',
    experienceRequired: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Fetch jobs - FIXED: Using correct service method
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', filters, currentPage],
    queryFn: async () => {
      try {
        const result = await jobService.getJobs({
          ...filters,
          page: currentPage,
          limit: 12
        });
        console.log('Jobs fetched:', result);
        return result;
      } catch (err) {
        console.error('Error fetching jobs:', err);
        throw err;
      }
    },
    retry: 1
  });

  // Debug logging
  useEffect(() => {
    console.log('Current user:', user);
    console.log('Jobs data:', data);
    console.log('Loading:', isLoading);
    console.log('Error:', error);
  }, [user, data, isLoading, error]);

  const handleShowInterest = async (jobId, hasReferral) => {
    if (hasReferral) {
      navigate(`/jobs/${jobId}`)
    } else {
      try {
        await jobService.showInterest(jobId, { requestReferral: false })
        toast.success('Interest shown successfully!')
        refetch()
      } catch (error) {
        toast.error('Failed to show interest')
      }
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load jobs</p>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button onClick={() => refetch()} className="btn-primary">
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
            <p className="text-gray-600 mt-1">Discover opportunities from your alumni network</p>
          </div>
          {!isStudent && (
            <Link to="/jobs/post" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Post Job
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search jobs..."
                  className="input pl-10"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="label">Target Audience</label>
                  <select
                    value={filters.targetAudience}
                    onChange={(e) => setFilters({ ...filters, targetAudience: e.target.value })}
                    className="input"
                  >
                    <option value="">All</option>
                    <option value="all">All Students & Alumni</option>
                    <option value="my_batch">My Batch</option>
                    <option value="seniors">Seniors</option>
                    <option value="juniors">Juniors</option>
                  </select>
                </div>

                <div>
                  <label className="label">Experience Required</label>
                  <select
                    value={filters.experienceRequired}
                    onChange={(e) => setFilters({ ...filters, experienceRequired: e.target.value })}
                    className="input"
                  >
                    <option value="">Any</option>
                    <option value="any">Any Experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ search: '', targetAudience: '', experienceRequired: '' })
                      setCurrentPage(1)
                    }}
                    className="w-full btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : data?.jobs?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.jobs.map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  onShowInterest={!isStudent ? handleShowInterest : null}
                />
              ))}
            </div>

            {data.pagination.pages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.pagination.pages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description={filters.search ? "Try adjusting your search criteria" : "No job opportunities have been posted yet"}
            action={
              !isStudent ? {
                label: "Post First Job",
                onClick: () => navigate('/jobs/post')
              } : null
            }
          />
        )}
      </div>
    </Layout>
  )
}

export default JobsPage