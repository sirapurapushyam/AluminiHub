// components/mentorship/CollegeFilter.js
import React from 'react'
import { Building2, Globe, Filter } from 'lucide-react'

const CollegeFilter = ({ 
  activeFilter, 
  onChange, 
  sameCollegeCount = 0, 
  otherCollegeCount = 0,
  className = "" 
}) => {
  return (
    <div className={`inline-flex items-center bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center px-3 py-2 text-sm text-gray-500">
        <Filter className="w-4 h-4 mr-2" />
        Filter by:
      </div>
      
      <div className="flex">
        <button
          onClick={() => onChange('same')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
            activeFilter === 'same'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Your College
          {sameCollegeCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === 'same' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {sameCollegeCount}
            </span>
          )}
        </button>
        
        <button
          onClick={() => onChange('other')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-l border-gray-200 rounded-r-lg transition-colors ${
            activeFilter === 'other'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          Other Colleges
          {otherCollegeCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === 'other' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {otherCollegeCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default CollegeFilter