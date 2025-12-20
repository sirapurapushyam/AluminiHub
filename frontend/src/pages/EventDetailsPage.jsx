// src/pages/EventDetailsPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Calendar, MapPin, Users, Clock, User, 
  Edit, Trash2, Download, X, ChevronLeft 
} from 'lucide-react'
import { format } from 'date-fns'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import eventService from '../services/events'
import toast from 'react-hot-toast'

const EventDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attendees, setAttendees] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAttendeesModal, setShowAttendeesModal] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const fetchEventDetails = async () => {
    try {
      const response = await eventService.getEventDetails(id)
      setEvent(response.event)
    } catch (error) {
      console.error('Failed to fetch event details:', error)
      toast.error('Failed to load event details')
      navigate('/events')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendees = async () => {
    try {
      const response = await eventService.getAttendees(id)
      setAttendees(response.attendees || [])
    } catch (error) {
      console.error('Failed to fetch attendees:', error)
      toast.error('Failed to load attendees')
    }
  }

  const handleRegister = async () => {
    setLoadingAction(true)
    try {
      await eventService.registerForEvent(id)
      toast.success('Successfully registered for the event!')
      fetchEventDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleCancelRegistration = async () => {
    setLoadingAction(true)
    try {
      await eventService.cancelRegistration(id)
      toast.success('Registration cancelled')
      fetchEventDetails()
    } catch (error) {
      toast.error('Failed to cancel registration')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDelete = async () => {
    try {
      await eventService.deleteEvent(id)
      toast.success('Event deleted successfully')
      navigate('/events')
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const downloadAttendeesList = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Phone', 'Registered At', 'Status'],
      ...attendees.map(a => [
        `${a.firstName} ${a.lastName}`,
        a.email,
        a.role,
        a.phone || 'N/A',
        format(new Date(a.registeredAt), 'yyyy-MM-dd HH:mm'),
        a.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '-')}-attendees-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Attendees list downloaded')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    )
  }

  if (!event) return null

  const isOrganizer = event.organizer?._id === user._id
  const isAdmin = user.role === 'college_admin'
  const canManage = isOrganizer || isAdmin
  const eventDate = new Date(event.eventDate)
  const isPast = eventDate < new Date()
  const isFull = event.maxAttendees && event.attendeeCount >= event.maxAttendees

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {event.eventImage && (
            <img
              src={event.eventImage}
              alt={event.title}
              className="w-full h-48 sm:h-64 lg:h-80 object-cover"
            />
          )}

          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-start gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{event.title}</h1>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                    event.eventType === 'seminar' ? 'bg-blue-100 text-blue-800' :
                    event.eventType === 'workshop' ? 'bg-green-100 text-green-800' :
                    event.eventType === 'reunion' ? 'bg-purple-100 text-purple-800' :
                    event.eventType === 'cultural' ? 'bg-pink-100 text-pink-800' :
                    event.eventType === 'sports' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.eventType}
                  </span>
                </div>
                {/* Target Audience */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {event.targetRoles?.map(role => (
                    <span key={role} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {role === 'all' ? 'Everyone' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
              
              {canManage && (
                <div className="flex gap-2">
                  <Link
                    to={`/events/${id}/edit`}
                    className="btn-secondary"
                  >
                    <Edit className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-secondary text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{format(eventDate, 'PPP')}</p>
                  <p className="text-sm text-gray-600">{format(eventDate, 'p')}</p>
                  {event.eventEndDate && (
                    <p className="text-sm text-gray-600">
                      Ends: {format(new Date(event.eventEndDate), 'PPp')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                  {event.venue && <p className="text-sm text-gray-600">{event.venue}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Attendees</p>
                  <p className="font-medium">
                    {event.attendeeCount || 0}
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                    {event.maxAttendees && event.availableSeats > 0 && (
                      <span className="text-sm text-gray-600 ml-2">
                        ({event.availableSeats} seats available)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {event.registrationDeadline && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Registration Deadline</p>
                    <p className="font-medium">
                      {format(new Date(event.registrationDeadline), 'PPP')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About this event</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Organizer Info */}
            <div className="border-t pt-6 mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={event.organizer?.profileImage || `https://ui-avatars.com/api/?name=${event.organizer?.firstName}+${event.organizer?.lastName}`}
                  alt={event.organizer?.firstName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm text-gray-500">Organized by</p>
                  <p className="font-medium">
                    {event.organizer?.firstName} {event.organizer?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {canManage && (
                <button
                  onClick={() => {
                    setShowAttendeesModal(true)
                    fetchAttendees()
                  }}
                  className="btn-secondary flex-1 sm:flex-initial"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Attendees ({event.attendeeCount || 0})
                </button>
              )}
              
              {!canManage && !isPast && (
                <>
                  {event.isRegistered ? (
                    <button
                      onClick={handleCancelRegistration}
                      disabled={loadingAction}
                      className="btn-secondary flex-1"
                    >
                      {loadingAction ? <LoadingSpinner size="small" /> : 'Cancel Registration'}
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isFull || loadingAction}
                      className="btn-primary flex-1"
                    >
                      {loadingAction ? <LoadingSpinner size="small" color="white" /> : 
                        isFull ? 'Event Full' : 'Register for Event'}
                    </button>
                  )}
                </>
              )}
              
              {isPast && (
                <div className="text-center flex-1 py-2 text-gray-500">
                  This event has ended
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDeleteModal(false)} />
              
              <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-4">Delete Event</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendees Modal */}
        {showAttendeesModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
// Continue EventDetailsPage.jsx
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowAttendeesModal(false)} />
              
              <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Event Attendees ({attendees.length})</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadAttendeesList}
                      className="btn-secondary text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => setShowAttendeesModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  {attendees.length > 0 ? (
                    <div className="space-y-3">
                      {attendees.map((attendee, index) => (
                        <div key={attendee._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-500 w-8">{index + 1}</span>
                            <img
                              src={`https://ui-avatars.com/api/?name=${attendee.firstName}+${attendee.lastName}`}
                              alt={attendee.firstName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{attendee.firstName} {attendee.lastName}</p>
                              <p className="text-sm text-gray-600">{attendee.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                              attendee.role === 'student' ? 'bg-green-100 text-green-800' :
                              attendee.role === 'alumni' ? 'bg-blue-100 text-blue-800' :
                              attendee.role === 'faculty' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {attendee.role}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(attendee.registeredAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No attendees registered yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default EventDetailsPage