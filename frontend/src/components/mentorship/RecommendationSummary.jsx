// components/mentorship/RecommendationSummary.js
import React from 'react'
import { Building2, Globe, TrendingUp, Star } from 'lucide-react'

const RecommendationSummary = ({ sameCollege, otherCollege, onCollegeFilterChange, activeFilter }) => {
  const totalRecommendations = sameCollege.length + otherCollege.length
  
  const avgScoreSame = sameCollege.length > 0 
    ? sameCollege.reduce((sum, mentor) => sum + mentor.recommendationScore, 0) / sameCollege.length 
    : 0

  const avgScoreOther = otherCollege.length > 0 
    ? otherCollege.reduce((sum, mentor) => sum + mentor.recommendationScore, 0) / otherCollege.length 
    : 0

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Your Mentor Recommendations</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Recommendations */}
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalRecommendations}</div>
          <div className="text-sm text-gray-600">Total Recommendations</div>
          <div className="flex items-center justify-center mt-2">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-gray-500">AI Matched</span>
          </div>
        </div>

        {/* Same College */}
        <div 
          className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${
            activeFilter === 'same' ? 'ring-2 ring-green-500 shadow-md' : 'hover:shadow-md'
          }`}
          onClick={() => onCollegeFilterChange('same')}
        >
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <div className="text-right">
              <div className="text-xl font-bold text-green-700">{sameCollege.length}</div>
              <div className="text-xs text-green-600">Your College</div>
            </div>
          </div>
          {avgScoreSame > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">Avg Match:</span>
              <span className="text-xs font-medium text-green-600">
                {Math.round(avgScoreSame * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Other Colleges */}
        <div 
          className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${
            activeFilter === 'other' ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
          }`}
          onClick={() => onCollegeFilterChange('other')}
        >
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <div className="text-right">
              <div className="text-xl font-bold text-blue-700">{otherCollege.length}</div>
              <div className="text-xs text-blue-600">Other Colleges</div>
            </div>
          </div>
          {avgScoreOther > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">Avg Match:</span>
              <span className="text-xs font-medium text-blue-600">
                {Math.round(avgScoreOther * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Recommendations based on your profile skills and interests
          </span>
          <div className="flex items-center gap-4">
            <span className="text-green-600">
              ✓ {sameCollege.length} same college
            </span>
            <span className="text-blue-600">
              ✓ {otherCollege.length} other colleges
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendationSummary