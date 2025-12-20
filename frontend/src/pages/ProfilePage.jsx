import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Mail, Phone, Calendar, MapPin, Briefcase, 
  GraduationCap, Building2, Edit, MessageSquare,
  Linkedin, Github, Globe, FileText, CheckCircle, Download, Eye, ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/users'
import Tag from '../components/common/Tag'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const isOwnProfile = !userId || userId === currentUser?._id

  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId || 'me'],
    queryFn: () => userService.getUserProfile(userId)
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    )
  }

  const profile = data?.user

  const roleColors = {
    student: 'bg-green-100 text-green-800',
    alumni: 'bg-blue-100 text-blue-800',
    faculty: 'bg-purple-100 text-purple-800',
    college_admin: 'bg-red-100 text-red-800',
    super_admin: 'bg-indigo-100 text-indigo-800'
  }

  const approvalStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  // FIXED: Helper functions for resume handling
  const handleResumeView = async (resumeUrl) => {
    if (resumeUrl) {
      try {
        // Open in new tab for viewing (not downloading)
        const viewWindow = window.open(resumeUrl, '_blank', 'noopener,noreferrer,width=1024,height=768');
        if (!viewWindow) {
          // Fallback if popup blocked
          window.location.href = resumeUrl;
        }
      } catch (error) {
        console.error('Error opening resume:', error);
        toast.error('Unable to open resume');
      }
    }
  };

  const handleResumeDownload = async (resumeUrl, fileName) => {
    if (resumeUrl) {
      try {
        // Create download URL with attachment flag
        const downloadUrl = resumeUrl.includes('?') 
          ? `${resumeUrl}&fl_attachment=${encodeURIComponent(fileName)}`
          : `${resumeUrl}?fl_attachment=${encodeURIComponent(fileName)}`;
        
        // Create temporary anchor for download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Resume download started');
      } catch (error) {
        console.error('Error downloading resume:', error);
        toast.error('Unable to download resume');
      }
    }
  };

  // Get resume filename for download
  const getResumeFileName = () => {
    if (profile?.profile?.resumeOriginalName) {
      return profile.profile.resumeOriginalName;
    }
    // Fallback filename based on user name and file type
    const extension = profile?.profile?.resumeMimeType === 'application/pdf' ? '.pdf' : '.doc';
    return `${profile?.firstName}_${profile?.lastName}_Resume${extension}`;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {/* Cover Image */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-primary-600 to-primary-700"></div>
          
          <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 mb-6">
              <img
                src={profile?.profileImage || `https://ui-avatars.com/api/?name=${profile?.firstName}+${profile?.lastName}&size=128`}
                alt={`${profile?.firstName} ${profile?.lastName}`}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto sm:mx-0"
              />
              
              <div className="flex-1 mt-4 sm:mt-0 sm:ml-6 sm:mb-3 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {profile?.firstName} {profile?.lastName}
                      </h1>
                      {profile?.approvalStatus === 'approved' && (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto sm:mx-0" title="Verified" />
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${roleColors[profile?.role]} mx-auto sm:mx-0`}>
                        {profile?.role?.replace('_', ' ').toUpperCase()}
                      </span>
                      {profile?.approvalStatus !== 'approved' && (
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${approvalStatusColors[profile?.approvalStatus]} mx-auto sm:mx-0`}>
                          {profile?.approvalStatus?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-center sm:justify-end space-x-3 mt-4 sm:mt-0">
                    {isOwnProfile ? (
                      <Link to="/profile/edit" className="btn-primary">
                        <Edit className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Edit Profile</span>
                        <span className="sm:hidden">Edit</span>
                      </Link>
                    ) : (
                      <Link 
                        to={`/messages?user=${profile?._id}`} 
                        className="btn-primary"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile?.profile?.bio && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">About</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{profile.profile.bio}</p>
              </div>
            )}

            {/* Contact Information & Role-specific Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 break-all">
                    <Mail className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{profile?.email}</span>
                  </div>
                  {profile?.profile?.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{profile.profile.phone}</span>
                    </div>
                  )}
                  {profile?.profile?.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{profile.profile.location}</span>
                    </div>
                  )}
                  {profile?.college?.name && (
                    <div className="flex items-center text-gray-600">
                      <Building2 className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{profile.college.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Role-specific Information */}
              <div>
                {profile?.role === 'student' && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                    <div className="space-y-3">
                      {profile.course && (
                        <div className="flex items-center text-gray-600">
                          <GraduationCap className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{profile.course}</span>
                        </div>
                      )}
                      {profile.yearOfStudy && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">Year {profile.yearOfStudy}</span>
                        </div>
                      )}
                      {profile.studentId && (
                        <div className="flex items-center text-gray-600">
                          <Building2 className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">Student ID: {profile.studentId}</span>
                        </div>
                      )}
                      {profile.profile?.graduationYear && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">Expected Graduation: {profile.profile.graduationYear}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {profile?.role === 'alumni' && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                    <div className="space-y-3">
                      {profile.profile?.position && profile.profile?.company && (
                        <div className="flex items-start text-gray-600">
                          <Briefcase className="w-5 h-5 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{profile.profile.position} at {profile.profile.company}</span>
                        </div>
                      )}
                      {profile.degree && (
                        <div className="flex items-center text-gray-600">
                          <GraduationCap className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{profile.degree}</span>
                        </div>
                      )}
                      {profile.department && (
                        <div className="flex items-center text-gray-600">
                          <Building2 className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{profile.department}</span>
                        </div>
                      )}
                      {profile.profile?.graduationYear && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">Class of {profile.profile.graduationYear}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {profile?.role === 'faculty' && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Faculty Information</h3>
                    <div className="space-y-3">
                      {profile.designation && (
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{profile.designation}</span>
                        </div>
                      )}
                      {profile.department && (
                        <div className="flex items-center text-gray-600">
                          <Building2 className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{profile.department}</span>
                        </div>
                      )}
                      {profile.employeeId && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base">Employee ID: {profile.employeeId}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* FIXED: Resume Section with View and Download */}
            {profile?.profile?.resume && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg font-semibold mb-4">Resume</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center">
                      <FileText className="w-6 h-6 mr-3 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {profile.profile.resumeOriginalName || 'Resume'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {profile.profile.resumeMimeType === 'application/pdf' ? 'PDF Document' : 'Word Document'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* View Button */}
                      <button
                        onClick={() => handleResumeView(profile.profile.resume)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Resume
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                      
                      {/* Download Button */}
                      <button
                        onClick={() => handleResumeDownload(profile.profile.resume, getResumeFileName())}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skills & Expertise */}
            {profile?.profile?.skills && Array.isArray(profile.profile.skills) && profile.profile.skills.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg font-semibold mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.skills
                    .filter(skill => skill && typeof skill === 'string' && skill.trim())
                    .map((skill, index) => (
                      <Tag
                        key={`skill-${index}-${skill}`}
                        text={skill.trim()}
                        variant="primary"
                        size="md"
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {profile?.profile?.interests && Array.isArray(profile.profile.interests) && profile.profile.interests.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg font-semibold mb-4">Interest Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.interests
                    .filter(interest => interest && typeof interest === 'string' && interest.trim())
                    .map((interest, index) => (
                      <Tag
                        key={`interest-${index}-${interest}`}
                        text={interest.trim()}
                        variant="secondary"
                        size="md"
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(profile?.profile?.linkedIn || profile?.profile?.github || profile?.profile?.website) && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                <div className="flex flex-wrap gap-4">
                  {profile.profile.linkedIn && (
                    <a
                      href={profile.profile.linkedIn.startsWith('http') ? profile.profile.linkedIn : `https://${profile.profile.linkedIn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <Linkedin className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">LinkedIn</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                  {profile.profile.github && (
                    <a
                      href={profile.profile.github.startsWith('http') ? profile.profile.github : `https://${profile.profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">GitHub</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                  {profile.profile.website && (
                    <a
                      href={profile.profile.website.startsWith('http') ? profile.profile.website : `https://${profile.profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Website</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="pt-6 sm:pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Member since:</span>
                  <span className="ml-2">{format(new Date(profile?.createdAt), 'MMMM yyyy')}</span>
                </div>
                {profile?.lastLogin && (
                  <div>
                    <span className="font-medium">Last active:</span>
                    <span className="ml-2">{format(new Date(profile.lastLogin), 'PPp')}</span>
                  </div>
                )}
                {profile?.isEmailVerified && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Email Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage