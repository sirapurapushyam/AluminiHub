// components/jobs/JobCard.jsx
import React from 'react'
import { Briefcase, DollarSign, Clock, Users, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

const JobCard = ({ job, onShowInterest, userInteraction }) => {
  const targetAudienceLabels = {
    my_batch: 'My Batch',
    seniors: 'Seniors',
    juniors: 'Juniors',
    all: 'All Students'
  }

  return (
    <div className="card hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
        {job.referralAvailable && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            {job.availableReferrals} Referrals
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          {job.package}
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          For: {targetAudienceLabels[job.targetAudience]}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </div>
      </div>

      {job.description && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{job.description}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-3">
          <img
            src={job.postedBy.profileImage || `https://ui-avatars.com/api/?name=${job.postedBy.firstName}+${job.postedBy.lastName}`}
            alt={job.postedBy.firstName}
            className="w-8 h-8 rounded-full"
          />
          <div className="text-sm">
            <p className="font-medium">{job.postedBy.firstName} {job.postedBy.lastName}</p>
            <p className="text-gray-500">{job.postedBy.role.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={job.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <Link 
            to={`/jobs/${job._id}`}
            className="btn-secondary text-sm"
          >
            View Details
          </Link>
          {!job.hasShownInterest && onShowInterest && (
            <button
              onClick={() => onShowInterest(job._id, job.referralAvailable)}
              className="btn-primary text-sm"
            >
              Interested
            </button>
          )}
        </div>
      </div>

      {job.hasShownInterest && (
        <div className="mt-3 text-sm">
          {job.referralGranted ? (
            <span className="text-green-600">✓ Referral Granted</span>
          ) : job.hasRequestedReferral ? (
            <span className="text-yellow-600">⏳ Referral Requested</span>
          ) : (
            <span className="text-gray-600">✓ Interest Shown</span>
          )}
        </div>
      )}
    </div>
  )
}

export default JobCard