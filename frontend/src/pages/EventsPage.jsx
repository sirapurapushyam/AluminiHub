// src/pages/EventsPage.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Plus, Filter, Grid, List } from 'lucide-react'
import Layout from '../components/common/Layout'
import EventCard from '../components/events/EventCard'
import EventFilters from '../components/events/EventFilters'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import eventService from '../services/events'
import toast from 'react-hot-toast'

const EventsPage = () => {
  const { user, isAdmin, isFaculty, isAlumni } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    eventType: 'all',
    upcoming: true,
    past: false,
    search: ''
  })
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  React.useEffect(() => {
    fetchEvents()
  }, [filters, currentPage])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      // Prepare parameters for API call
      const params = {
        page: currentPage,
        limit: 12
      }

      // Add eventType filter
      if (filters.eventType && filters.eventType !== 'all') {
        params.eventType = filters.eventType
      }

      // Add date filters
      if (filters.upcoming) {
        params.upcoming = 'true'
      } else if (filters.past) {
        params.past = 'true'
      }

      // Add search filter
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim()
      }

      console.log('Fetching events with params:', params) // Debug log

      const response = await eventService.getCollegeEvents(user.collegeCode, params)
      setEvents(response.events || [])
      setTotalPages(response.pagination?.pages || 1)
    } catch (error) {
      console.error('Failed to fetch events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId)
      toast.success('Successfully registered for the event!')
      fetchEvents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  const handleCancelRegistration = async (eventId) => {
    try {
      await eventService.cancelRegistration(eventId)
      toast.success('Registration cancelled')
      fetchEvents()
    } catch (error) {
      toast.error('Failed to cancel registration')
    }
  }

  const handleFilterChange = (newFilters) => {
    console.log('Filter changed:', newFilters) // Debug log
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const canCreateEvent = isAdmin || isFaculty || isAlumni

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary lg:hidden flex-1 sm:flex-initial"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {canCreateEvent && (
              <Link to="/events/create" className="btn-primary flex-1 sm:flex-initial">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-80">
            <EventFilters 
              filters={filters} 
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </div>

          {/* Mobile Filters - Slide Panel */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Filters</h3>
                </div>
                <div className="p-4">
                  <EventFilters 
                    filters={filters} 
                    onFilterChange={handleFilterChange}
                    onClose={() => setShowFilters(false)}
                    isMobile
                  />
                </div>
              </div>
            </div>
          )}

          {/* Events Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : events.length > 0 ? (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                  : "space-y-4"
                }>
                  {events.map(event => (
                    <EventCard
                      key={event._id}
                      event={event}
                      viewMode={viewMode}
                      onRegister={handleRegister}
                      onCancelRegistration={handleCancelRegistration}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="btn-secondary disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="btn-secondary disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No events found"
                description={filters.search ? "Try adjusting your search criteria" : "No events have been created yet"}
                action={canCreateEvent ? {
                  label: "Create First Event",
                  href: "/events/create"
                } : null}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default EventsPage