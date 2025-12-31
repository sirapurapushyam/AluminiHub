import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  Home, Calendar, Briefcase, Users, MessageSquare,
  UserCircle, Settings, LogOut, Menu, X, Bell,
  GraduationCap, Heart, Shield, ChevronDown, LifeBuoy,
  GraduationCapIcon
} from 'lucide-react'

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isStudent, isAlumni, isFaculty, isAdmin, isSuperAdmin } = useAuth()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [location, isMobile])

  // Role-based menu items
  const getMenuItems = () => {
    // Super Admin - Limited access
    if (isSuperAdmin) {
      return [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Shield, label: 'Admin Panel', path: '/admin/colleges' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
      ]
    }

    // College Admin - Full admin access
    if (isAdmin) {
      return [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Shield, label: 'Admin Panel', path: '/admin/users' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Users, label: 'Directory', path: '/directory' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Heart, label: 'Donations', path: '/donations' },
        
        { icon: LifeBuoy, label: 'Support', path: '/support' },
      ]
    }

    // Students
    if (isStudent) {
      return [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Users, label: 'Directory', path: '/directory' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: GraduationCap, label: 'Mentorship', path: '/mentorship' },
        { icon: Briefcase, label: 'ATS Check', path: '/studentats' },
        { icon: LifeBuoy, label: 'Support', path: '/support' },
      ]
    }

    // Alumni
    if (isAlumni) {
      return [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Users, label: 'Directory', path: '/directory' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: GraduationCap, label: 'Mentorship', path: '/mentorship' },
        { icon: GraduationCap, label: 'ATS', path: '/allats' },
        { icon: Heart, label: 'Donations', path: '/donations' },
        { icon: LifeBuoy, label: 'Support', path: '/support' },
      ]
    }

    // Faculty
    if (isFaculty) {
      return [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: Briefcase, label: 'Jobs & Referrals', path: '/jobs' },
        { icon: Users, label: 'Directory', path: '/directory' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: LifeBuoy, label: 'Support', path: '/support' },
        { icon: GraduationCap, label: 'Mentorship', path: '/mentorship' },
      ]
    }

    // Default (fallback)
    return [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: MessageSquare, label: 'Messages', path: '/messages' },
      { icon: LifeBuoy, label: 'Support', path: '/support' },
    ]
  }

  const menuItems = getMenuItems()

  const roleColors = {
    student: 'bg-green-100 text-green-800',
    alumni: 'bg-blue-100 text-blue-800',
    faculty: 'bg-purple-100 text-purple-800',
    college_admin: 'bg-red-100 text-red-800',
    super_admin: 'bg-gray-900 text-white'
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 h-full">
          <div className="flex flex-col h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/dashboard" className="flex items-center space-x-2">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              >
                <GraduationCap className="w-6 h-6" />
              </motion.div>
                <span className="text-xl font-bold text-gray-900">AlumConnect</span>
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[user?.role]}`}>
                    {user?.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen && isMobile) && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/dashboard" className="flex items-center space-x-2">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              >
                <GraduationCapIcon className="w-6 h-6" />
              </motion.div>
                <span className="text-xl font-bold text-gray-900">AlumConnect</span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[user?.role]}`}>
                    {user?.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation - Fixed */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex-1" />

              <div className="flex items-center space-x-4">
                {/* Notifications - Hide for Super Admin */}
                {!isSuperAdmin && (
                  <button className="relative text-gray-500 hover:text-gray-700">
                    <Bell className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <img
                      src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50"
                        >
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <UserCircle className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                          <Link
                            to="/profile/edit"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                          <hr className="my-1" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </button>
                        </motion.div>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileMenuOpen(false)}
                        />
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout