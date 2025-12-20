import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Briefcase, Users, Award } from 'lucide-react'
import StatsCard from '../common/StatsCard'
import EventCard from '../events/EventCard'
import JobCard from '../jobs/JobCard'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import api from '../../services/api'
import eventService from '../../services/events'
import { jobService } from '../../services/jobs'

const StudentDashboard = ({ user }) => {
  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['studentDashboardStats', user.collegeCode],
    queryFn: async () => {
      const [eventsRes, jobsRes, alumniCountRes, profileRes] = await Promise.all([
        eventService.getCollegeEvents(user.collegeCode, { upcoming: true, limit: 3 }),
        jobService.getJobs({ collegeCode: user.collegeCode, limit: 3, jobType: 'internship' }),
        api.get(`/users/college/${user.collegeCode}`, { params: { role: 'alumni' } }),
        api.get(`/users/profile/${user._id}`)
      ])

      return {
        upcomingEvents: eventsRes.events || [],
        internships: jobsRes.jobs || [],
        alumniCount: alumniCountRes.data?.pagination?.total || 0,
        profileViews: profileRes.data?.user?.profile?.views || 0
      }
    },
    // Keep data fresh but not too aggressive
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}! 👋</h1>
        <p className="text-primary-100">
          Ready to explore new opportunities and connect with your alumni network?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          icon={Calendar}
          label="Upcoming Events"
          value={stats?.upcomingEvents?.length || 0}
          color="blue"
        />
        <StatsCard
          icon={Briefcase}
          label="Available Internships"
          value={stats?.internships?.length || 0}
          color="green"
        />
        <StatsCard
          icon={Users}
          label="Alumni Connections"
          value={stats?.alumniCount || 0}
          color="purple"
        />
        <StatsCard
          icon={Award}
          label="Profile Views"
          value={stats?.profileViews || 0}
          color="orange"
        />
      </div>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Upcoming Events</h2>
          <Link to="/events" className="text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>
        {stats?.upcomingEvents?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.upcomingEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No upcoming events"
            description="Check back later for exciting events and activities"
            action={{
              label: "Browse All Events",
              onClick: () => (window.location.href = '/events')
            }}
          />
        )}
      </section>

      {/* Internship Opportunities */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Internship Opportunities</h2>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>
        {stats?.internships?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.internships.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No internships available"
            description="New opportunities will be posted soon"
            action={{
              label: "Explore All Jobs",
              onClick: () => (window.location.href = '/jobs')
            }}
          />
        )}
      </section>
    </div>
  )
}

export default StudentDashboard
