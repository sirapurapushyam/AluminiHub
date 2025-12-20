import React from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/common/Layout'
import StudentDashboard from '../components/dashboard/StudentDashboard'
import AlumniDashboard from '../components/dashboard/AlumniDashboard'
import FacultyDashboard from '../components/dashboard/FacultyDashboard'
import AdminDashboard from '../components/dashboard/AdminDashboard'

const DashboardPage = () => {
  const { user, isStudent, isAlumni, isFaculty, isAdmin } = useAuth()

  return (
    <Layout>
      {isStudent && <StudentDashboard user={user} />}
      {isAlumni && <AlumniDashboard user={user} />}
      {isFaculty && <FacultyDashboard user={user} />}
      {isAdmin && <AdminDashboard user={user} />}
    </Layout>
  )
}

export default DashboardPage