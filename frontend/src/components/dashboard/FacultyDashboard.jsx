import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Users, BookOpen, PlusCircle, FileText, GraduationCap } from 'lucide-react'
import StatsCard from '../common/StatsCard'
import EventCard from '../events/EventCard'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import api from '../../services/api'

const FacultyDashboard = ({ user }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['facultyDashboardStats', user._id],
    queryFn: async () => {
      const [eventsRes, mentorshipRes, studentCountRes, alumniCountRes] = await Promise.all([
        api.get(`/events/college/${user.collegeCode}`, { params: { organizer: user._id, limit: 3 } }),
        api.get('/mentorship/requests', { params: { status: 'pending', limit: 3 } }),
        api.get(`/users/college/${user.collegeCode}`, { params: { role: 'student' } }),
        api.get(`/users/college/${user.collegeCode}`, { params: { role: 'alumni' } })
      ])
      return {
        myEvents: eventsRes.data.events,
        pendingMentorshipRequests: mentorshipRes.data.requests,
        studentCount: studentCountRes.data.pagination.total,
        alumniCount: alumniCountRes.data.pagination.total
      }
    }
  })

  if (isLoading) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, Prof. {user.lastName}! 📚</h1>
        <p className="text-purple-100">
          Manage events, connect with students, and build lasting relationships.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          icon={Calendar}
          label="My Events"
          value={stats?.myEvents?.length || 0}
          color="purple"
        />
        <StatsCard
          icon={Users}
          label="Pending Requests"
          value={stats?.pendingMentorshipRequests?.length || 0}
          color="green"
        />
        <StatsCard
          icon={GraduationCap}
          label="Total Students"
          value={stats?.studentCount || 0}
          color="blue"
        />
        <StatsCard
          icon={Users}
          label="Total Alumni"
          value={stats?.alumniCount || 0}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/events/create" className="card hover:shadow-xl transition-all group">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Create Event</h3>
          </div>
        </Link>
        <Link to="/jobs/post" className="card hover:shadow-xl transition-all group">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Post Opportunity</h3>
          </div>
        </Link>
        <Link to="/directory" className="card hover:shadow-xl transition-all group">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Student Directory</h3>
          </div>
        </Link>
        <Link to="/mentorship" className="card hover:shadow-xl transition-all group">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold">Mentorship</h3>
          </div>
        </Link>
      </section>

      {/* My Events */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Events</h2>
          <Link to="/events" className="text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>
        {stats?.myEvents?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.myEvents.slice(0, 3).map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first event</p>
            <Link to="/events/create" className="btn-primary">
              Create Event
            </Link>
          </div>
        )}
      </section>

      {/* Recent Mentorship Requests */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Recent Mentorship Requests</h2>
        {stats?.pendingMentorshipRequests?.length > 0 ? (
          <div className="card space-y-3">
            {stats.pendingMentorshipRequests.map(request => (
              <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">New request from {request.mentee.firstName}</p>
                    <p className="text-sm text-gray-600">Area: {request.area}</p>
                  </div>
                </div>
                <Link to="/mentorship" className="text-primary-600 text-sm hover:underline">
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Users} title="No pending requests" description="You have no new mentorship requests." />
        )}
      </section>
    </div>
  )
}

export default FacultyDashboard