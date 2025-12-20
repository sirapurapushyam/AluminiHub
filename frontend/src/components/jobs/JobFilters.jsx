import React from 'react'
import { Filter, Search, DollarSign } from 'lucide-react'

const JobFilters = ({ filters, onFilterChange }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>

      <div>
        <label className="label">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search jobs..."
            className="input pl-10"
          />
        </div>
      </div>

      <div>
        <label className="label">Job Type</label>
        <select
          value={filters.jobType || ''}
          onChange={(e) => handleChange('jobType', e.target.value)}
          className="input"
        >
          <option value="">All Types</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
          <option value="freelance">Freelance</option>
        </select>
      </div>

      <div>
        <label className="label">Salary Range</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={filters.minSalary || ''}
              onChange={(e) => handleChange('minSalary', e.target.value)}
              placeholder="Min"
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={filters.maxSalary || ''}
              onChange={(e) => handleChange('maxSalary', e.target.value)}
              placeholder="Max"
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => onFilterChange({})}
        className="w-full btn-secondary text-sm"
      >
        Clear Filters
      </button>
    </div>
  )
}

export default JobFilters