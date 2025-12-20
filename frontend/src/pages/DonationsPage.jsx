// src/pages/DonationsPage.jsx
import React from 'react'
import Layout from '../components/common/Layout'
import { useAuth } from '../context/AuthContext'
import DonationForm from '../components/donations/DonationForm'
import MyDonations from '../components/donations/MyDonations'
import AdminDonations from '../components/donations/AdminDonations'
import DonationStats from '../components/donations/DonationStats'

const DonationsPage = () => {
  const { isAdmin } = useAuth()

  return (
    <Layout>
      {isAdmin ? (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Donation Management</h1>
          <DonationStats />
          <AdminDonations />
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Support Your College</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DonationForm />
            </div>
            <div>
              <MyDonations />
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default DonationsPage