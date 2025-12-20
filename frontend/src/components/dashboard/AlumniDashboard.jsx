import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Briefcase, Users, Heart, MessageSquare } from 'lucide-react'
import StatsCard from '../common/StatsCard'
import EventCard from '../events/EventCard'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import api from '../../services/api'

const AlumniDashboard = ({ user }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['alumniDashboardStats'],
    queryFn: async () => {
      const [eventsRes, mentorshipRes, donationsRes, messagesRes] = await Promise.all([
        api.get(`/events/college/${user.collegeCode}`, { params: { upcoming: true, limit: 3 } }),
        api.get('/mentorship/requests', { params: { status: 'pending' } }),
        api.get('/donations/my-donations'),
        api.get('/messages/conversations')
      ])
      const totalDonated = donationsRes.data.donations.reduce((sum, d) => sum + d.amount, 0)
      const unreadMessages = messagesRes.data.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      return {
        upcomingEvents: eventsRes.data.events,
        mentorshipRequests: mentorshipRes.data.requests.length,
        totalDonations: totalDonated,
        unreadMessages: unreadMessages
      }
    }
  })

  if (isLoading) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}! 🎓</h1>
        <p className="text-blue-100">
          Stay connected with your alma mater and help shape the next generation.
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
          icon={Users}
          label="Mentorship Requests"
          value={stats?.mentorshipRequests || 0}
          color="green"
        />
        <StatsCard
          icon={Heart}
          label="Total Donations"
          value={`₹${(stats?.totalDonations || 0).toLocaleString()}`}
          color="purple"
        />
        <StatsCard
          icon={MessageSquare}
          label="New Messages"
          value={stats?.unreadMessages || 0}
          color="orange"
        />
      </div>

      {/* Upcoming Reunions & Events */}
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
            description="Check back later for reunions and networking events"
          />
        )}
      </section>

      {/* Ways to Contribute */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Ways to Contribute</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/jobs/post" className="card hover:shadow-xl transition-all group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Post Job Openings</h3>
                <p className="text-sm text-gray-600">Help students find opportunities</p>
              </div>
            </div>
          </Link>
          <Link to="/mentorship" className="card hover:shadow-xl transition-all group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Become a Mentor</h3>
                <p className="text-sm text-gray-600">Guide current students</p>
              </div>
            </div>
          </Link>
          <Link to="/donations" className="card hover:shadow-xl transition-all group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Support Your College</h3>
                <p className="text-sm text-gray-600">Make a donation</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="card">
        <h3 className="text-lg font-semibold mb-4">Recent College Updates</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 pb-3 border-b">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">New Computer Lab Inaugurated</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pb-3 border-b">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Annual Tech Fest Announced</p>
              <p className="text-xs text-gray-500">5 days ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Alumni Achievement: John Doe promoted to CEO</p>
              <p className="text-xs text-gray-500">1 week ago</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AlumniDashboard