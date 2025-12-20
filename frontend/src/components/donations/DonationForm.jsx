// src/components/donations/DonationForm.jsx
import React, { useState } from 'react'
import { Heart, CreditCard, Smartphone, Building2, Gift } from 'lucide-react'
import donationService from '../../services/donations'
import toast from 'react-hot-toast'

const DonationForm = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    purpose: 'general',
    purposeDescription: '',
    paymentMethod: 'upi',
    transactionId: '',
    isAnonymous: false,
    message: ''
  })

  const purposes = [
    { value: 'general', label: 'General Fund', icon: Heart },
    { value: 'infrastructure', label: 'Infrastructure Development', icon: Building2 },
    { value: 'scholarship', label: 'Student Scholarships', icon: Gift },
    { value: 'event', label: 'Events & Activities', icon: Gift },
    { value: 'research', label: 'Research & Innovation', icon: Gift },
    { value: 'other', label: 'Other', icon: Gift }
  ]

  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'netbanking', label: 'Net Banking', icon: Building2 },
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'wallet', label: 'Digital Wallet', icon: Smartphone },
    { value: 'cheque', label: 'Cheque', icon: Building2 },
    { value: 'cash', label: 'Cash', icon: Building2 }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid donation amount')
      return
    }

    if (!formData.transactionId) {
      toast.error('Please enter transaction ID')
      return
    }

    setLoading(true)
    try {
      await donationService.createDonation({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      
      toast.success('Donation recorded successfully! Thank you for your contribution.')
      
      // Reset form
      setFormData({
        amount: '',
        purpose: 'general',
        purposeDescription: '',
        paymentMethod: 'upi',
        transactionId: '',
        isAnonymous: false,
        message: ''
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record donation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Make a Donation</h2>
        <p className="text-gray-600">Support your alma mater and help shape the future of education</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Donation Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="pl-8 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter amount"
              required
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[500, 1000, 5000, 10000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ₹{amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Donation Purpose
          </label>
          <div className="grid grid-cols-2 gap-3">
            {purposes.map((purpose) => (
              <button
                key={purpose.value}
                type="button"
                onClick={() => setFormData({ ...formData, purpose: purpose.value })}
                className={`p-3 border rounded-lg text-left transition-all ${
                  formData.purpose === purpose.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <purpose.icon className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium">{purpose.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Purpose Description (if other) */}
        {formData.purpose === 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please specify
            </label>
            <textarea
              value={formData.purposeDescription}
              onChange={(e) => setFormData({ ...formData, purposeDescription: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the purpose of your donation"
              required
            />
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction ID / Reference Number
          </label>
          <input
            type="text"
            value={formData.transactionId}
            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter transaction ID"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Leave a message with your donation"
          />
        </div>

        {/* Anonymous Donation */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.isAnonymous}
            onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
            Make this donation anonymous
          </label>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Payment Instructions</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Complete your payment using the selected method</p>
            <p>• Note down the transaction ID/reference number</p>
            <p>• Submit this form with the transaction details</p>
            <p>• You'll receive a confirmation email once verified</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Submit Donation'}
        </button>
      </form>
    </div>
  )
}

export default DonationForm