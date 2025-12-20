import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import EventDetailsPage from './pages/EventDetailsPage'
import CreateEventPage from './pages/CreateEventPage'
import JobsPage from './pages/JobsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import PostJobPage from './pages/PostJobPage'
import DirectoryPage from './pages/DirectoryPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import MessagesPage from './pages/MessagesPage'
import MentorshipPage from './pages/MentorshipPage'
import DonationsPage from './pages/DonationsPage'
import AdminPage from './pages/AdminPage'
import SupportPage from './pages/SupportPage'
import QueryDetailsPage from './pages/QueryDetailsPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminQueryDetailsPage from './pages/AdminQueryDetailsPage'
import Ats from './pages/allATSPage'
import AtsCheck from './pages/studentATSPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/events/create" element={<CreateEventPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/jobs/post" element={<PostJobPage />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/profile/:userId?" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/mentorship" element={<MentorshipPage />} />
                <Route path="/donations" element={<DonationsPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/support/:queryId" element={<QueryDetailsPage />} />
                <Route path="/admin/support/:queryId" element={<AdminQueryDetailsPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/allats" element={<Ats />} />
                <Route path="/studentats" element={<AtsCheck />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App