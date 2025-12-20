// src/components/events/EventFilters.jsx
import React from 'react'
import { Calendar, Filter, Search, X } from 'lucide-react'

const EventFilters = ({ filters, onFilterChange, onClose, isMobile }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm ${isMobile ? '' : 'p-6'} space-y-4`}>
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
        <select
          value={filters.eventType || 'all'}
          onChange={(e) => handleChange('eventType', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="seminar">Seminar</option>
          <option value="workshop">Workshop</option>
          <option value="reunion">Reunion</option>
          <option value="cultural">Cultural</option>
          <option value="sports">Sports</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="period"
              value="upcoming"
              checked={filters.upcoming === true}
              onChange={() => {
                handleChange('upcoming', true)
                handleChange('past', false)
              }}
              className="mr-2 text-primary-600"
            />
            <span className="text-sm">Upcoming Events</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="period"
              value="past"
              checked={filters.past === true}
              onChange={() => {
                handleChange('past', true)
                handleChange('upcoming', false)
              }}
              className="mr-2 text-primary-600"
            />
            <span className="text-sm">Past Events</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="period"
              value="all"
              checked={!filters.upcoming && !filters.past}
              onChange={() => {
                handleChange('upcoming', false)
                handleChange('past', false)
              }}
              className="mr-2 text-primary-600"
            />
            <span className="text-sm">All Events</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onFilterChange({
            eventType: 'all',
            upcoming: true,
            past: false,
            search: ''
          })}
          className="btn-secondary flex-1 text-sm"
        >
          Clear Filters
        </button>
        {isMobile && (
          <button
            onClick={onClose}
// Continue EventFilters.jsx
            className="btn-primary flex-1 text-sm"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  )
}

export default EventFilters