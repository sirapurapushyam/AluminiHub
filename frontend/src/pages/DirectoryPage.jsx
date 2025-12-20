import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, UserPlus, Mail, MessageSquare,Users } from 'lucide-react'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/users'
import { Link } from 'react-router-dom'

const DirectoryPage = () => {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['directory', user.collegeCode, searchQuery, roleFilter, currentPage],
    queryFn: () => userService.getCollegeUsers(user.collegeCode, {
      search: searchQuery,
      role: roleFilter,
      page: currentPage,
      limit: 12
    })
  })

  const UserCard = ({ member }) => {
    const roleColors = {
      student: 'bg-green-100 text-green-800',
      alumni: 'bg-blue-100 text-blue-800',
      faculty: 'bg-purple-100 text-purple-800',
      college_admin: 'bg-red-100 text-red-800'
    }

    return (
      <div className="card hover:shadow-xl transition-all">
        <div className="flex items-start space-x-4">
          <img
            src={member.profileImage || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}`}
            alt={`${member.firstName} ${member.lastName}`}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {member.firstName} {member.lastName}
            </h3>
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[member.role]}`}>
              {member.role.replace('_', ' ').toUpperCase()}
            </span>
            
            {/* Role-specific info */}
            {member.role === 'student' && member.course && (
              <p className="text-sm text-gray-600 mt-1">
                {member.course} • Year {member.yearOfStudy}
              </p>
            )}
            {member.role === 'alumni' && (
              <p className="text-sm text-gray-600 mt-1">
                {member.profile?.position && `${member.profile.position} at ${member.profile.company}`}
                {member.profile?.graduationYear && ` • Class of ${member.profile.graduationYear}`}
              </p>
            )}
            {member.role === 'faculty' && member.department && (
              <p className="text-sm text-gray-600 mt-1">
                {member.designation} • {member.department}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
          <Link
            to={`/profile/${member._id}`}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            View Profile
          </Link>
          <Link
            to={`/messages?user=${member._id}`}
            className="px-3 py-1.5 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Message
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Alumni Directory</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by name, company, or skills..."
            className="input pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card">
            <h3 className="font-semibold mb-4">Filter by Role</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setRoleFilter('')
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !roleFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Members
              </button>
              <button
                onClick={() => {
                  setRoleFilter('student')
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  roleFilter === 'student' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => {
                  setRoleFilter('alumni')
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  roleFilter === 'alumni' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Alumni
              </button>
              <button
                onClick={() => {
                  setRoleFilter('faculty')
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  roleFilter === 'faculty' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Faculty
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        {data && (
          <div className="text-sm text-gray-600">
            Showing {data.users.length} of {data.total} members
          </div>
        )}

        {/* Members Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : data?.users?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.users
                .filter(member => member._id !== user._id) // 🚀 exclude logged-in user
                .map(member => (
                  <UserCard key={member._id} member={member} />
                ))}
            </div>
            
            {data.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No members found"
            description={searchQuery || roleFilter ? "Try adjusting your filters" : "No members in the directory yet"}
          />
        )}

      </div>
    </Layout>
  )
}

export default DirectoryPage