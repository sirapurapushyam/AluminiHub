// src/pages/CreateEventPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, MapPin, Users, Upload, X } from 'lucide-react'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import eventService from '../services/events'
import toast from 'react-hot-toast'

const CreateEventPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventEndDate: '',
    location: '',
    venue: '',
    eventType: 'seminar',
    targetAudience: ['all'],
    maxAttendees: '',
    registrationDeadline: ''
  })

  useEffect(() => {
    if (isEdit) {
      fetchEvent()
    }
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await eventService.getEventDetails(id)
      const event = response.event
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
        eventEndDate: event.eventEndDate ? new Date(event.eventEndDate).toISOString().slice(0, 16) : '',
        location: event.location || '',
        venue: event.venue || '',
        eventType: event.eventType || 'seminar',
        targetAudience: event.targetRoles || ['all'],
        maxAttendees: event.maxAttendees || '',
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : ''
      })
      if (event.eventImage) {
        setImagePreview(event.eventImage)
      }
    } catch (error) {
      toast.error('Failed to load event details')
      navigate('/events')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key === 'targetAudience') {
          if (formData[key].includes('all')) {
            formDataToSend.append('targetAudience', 'all')
          } else {
            formData[key].forEach(role => {
              formDataToSend.append('targetAudience', role)
            })
          }
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Add image if selected
      const imageInput = document.getElementById('eventImage')
      if (imageInput?.files?.[0]) {
        formDataToSend.append('eventImage', imageInput.files[0])
      }

      if (isEdit) {
        await eventService.updateEvent(id, formDataToSend)
        toast.success('Event updated successfully')
      } else {
        await eventService.createEvent(formDataToSend)
        toast.success('Event created successfully')
      }
      
      navigate('/events')
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} event`)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTargetAudienceChange = (value) => {
    if (value === 'all') {
      setFormData({ ...formData, targetAudience: ['all'] })
    } else {
      const newTargetAudience = formData.targetAudience.filter(v => v !== 'all')
      if (newTargetAudience.includes(value)) {
        setFormData({ 
          ...formData, 
          targetAudience: newTargetAudience.filter(v => v !== value) 
        })
      } else {
        setFormData({ 
          ...formData, 
          targetAudience: [...newTargetAudience, value] 
        })
      }
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Event Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image
            </label>
            <div className="relative">
              <input
                type="file"
                id="eventImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="eventImage"
                className="cursor-pointer block"
              >
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <p className="text-white">Click to change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload event image
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
              <option value="reunion">Reunion</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.targetAudience.includes('all')}
                  onChange={() => handleTargetAudienceChange('all')}
                  className="mr-2 text-primary-600"
                />
                <span>All (Students, Alumni, Faculty)</span>
              </label>
              {!formData.targetAudience.includes('all') && (
                <>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetAudience.includes('student')}
                      onChange={() => handleTargetAudienceChange('student')}
                      className="mr-2 text-primary-600"
                    />
                    <span>Students Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetAudience.includes('alumni')}
                      onChange={() => handleTargetAudienceChange('alumni')}
                      className="mr-2 text-primary-600"
                    />
                    <span>Alumni Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetAudience.includes('faculty')}
                      onChange={() => handleTargetAudienceChange('faculty')}
                      className="mr-2 text-primary-600"
                    />
                    <span>Faculty Only</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.eventEndDate}
                onChange={(e) => setFormData({ ...formData, eventEndDate: e.target.value })}
// Continue CreateEventPage.jsx
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min={formData.eventDate}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
                placeholder="e.g., Campus, Online, City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Auditorium, Room 101"
              />
            </div>
          </div>

          {/* Registration Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Attendees
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Leave empty for unlimited"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                max={formData.eventDate}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                isEdit ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default CreateEventPage