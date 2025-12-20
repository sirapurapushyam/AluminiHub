// src/components/events/EventCard.jsx
import React from 'react'
import { Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

const EventCard = ({ event, viewMode = 'grid', onRegister, onCancelRegistration }) => {
  const eventDate = new Date(event.eventDate)
  const isPast = eventDate < new Date()
  const isFull = event.maxAttendees && event.attendeeCount >= event.maxAttendees

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {event.eventImage && (
            <img
              src={event.eventImage}
              alt={event.title}
              className="w-full sm:w-48 h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                <span className={`flex-shrink-0 px-2 py-1 text-xs rounded-full font-medium ${
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
              <p className="text-gray-600 mt-1 line-clamp-2">{event.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(eventDate, 'MMM d, yyyy')}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {format(eventDate, 'h:mm a')}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {event.venue || event.location}
              </div>
              {event.maxAttendees && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {event.attendeeCount || 0}/{event.maxAttendees}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isPast && !isFull && !event.isRegistered && (
                  <button
                    onClick={() => onRegister(event._id)}
                    className="btn-primary text-sm"
                  >
                    Register
                  </button>
                )}
                {!isPast && event.isRegistered && (
                  <button
                    onClick={() => onCancelRegistration(event._id)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                )}
                <Link 
                  to={`/events/${event._id}`}
                  className="btn-secondary text-sm"
                >
                  View Details
                </Link>
              </div>
              {isPast && <span className="text-sm text-gray-500">Event ended</span>}
              {isFull && !isPast && <span className="text-sm text-orange-600 font-medium">Full</span>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid View (default)
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      {event.eventImage && (
        <img
          src={event.eventImage}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
          <span className={`flex-shrink-0 px-2 py-1 text-xs rounded-full font-medium ${
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

        <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            {format(eventDate, 'PPP')}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.venue || event.location}</span>
          </div>
          {event.maxAttendees && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              {event.attendeeCount || 0}/{event.maxAttendees} attendees
            </div>
          )}
        </div>

        <div className="pt-3 flex gap-2">
          <Link 
            to={`/events/${event._id}`}
            className="btn-secondary flex-1 text-sm text-center"
          >
            Details
          </Link>
          {!isPast && !isFull && !event.isRegistered && (
            <button
              onClick={() => onRegister(event._id)}
              className="btn-primary flex-1 text-sm"
            >
              Register
            </button>
          )}
          {!isPast && event.isRegistered && (
            <button
              onClick={() => onCancelRegistration(event._id)}
              className="btn-secondary flex-1 text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        {isFull && !isPast && !event.isRegistered && (
          <p className="text-center text-sm text-orange-600 font-medium">Event Full</p>
        )}
        {isPast && (
          <p className="text-center text-sm text-gray-500">Event Ended</p>
        )}
      </div>
    </div>
  )
}

export default EventCard