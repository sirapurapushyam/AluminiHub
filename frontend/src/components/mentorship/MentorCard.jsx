// components/mentorship/MentorCard.js
import React from 'react'
import { Star, Users, MapPin, Briefcase, Award, BookOpen } from 'lucide-react'

const MentorCard = ({ mentor, onRequest, showRecommendationScore = false }) => {
  const {
    firstName,
    lastName,
    profileImage,
    profile = {},
    mentorshipStats = {},
    matchingSkills = [],
    matchingInterests = [],
    college
  } = mentor

  const fullName = `${firstName} ${lastName}`
  const avatarUrl = profileImage || `https://ui-avatars.com/api/?name=${firstName}+${lastName}`

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{fullName}</h3>
          {profile.designation && (
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Briefcase className="w-3 h-3" />
              <span className="truncate">{profile.designation}</span>
            </p>
          )}
          {profile.company && (
            <p className="text-sm text-gray-500 truncate">{profile.company}</p>
          )}
          {college && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{college.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Mentorship Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{mentorshipStats.totalMentorships || 0} mentorships</span>
        </div>
        {mentorshipStats.avgRating && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>{mentorshipStats.avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Skills and Interests */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full ${
                  showRecommendationScore && matchingSkills.includes(skill)
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {skill}
              </span>
            ))}
            {profile.skills.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                +{profile.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {showRecommendationScore && matchingInterests.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Matching Interests:</p>
          <div className="flex flex-wrap gap-1">
            {matchingInterests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium"
              >
                {interest}
              </span>
            ))}
            {matchingInterests.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-500">
                +{matchingInterests.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {profile.experience && (
        <div className="mt-3">
          <p className="text-xs text-gray-600">
            <Award className="w-3 h-3 inline mr-1" />
            {profile.experience} years experience
          </p>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
        </div>
      )}

      {/* Request Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onRequest(mentor)}
          className="w-full btn-primary"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Request Mentorship
        </button>
      </div>
    </div>
  )
}

export default MentorCard