import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  Settings, Shield, Bell, Mail, Database, 
  Server, Key, Globe, Save, AlertCircle 
} from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SystemSettings = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/system/settings')
      return response.data.settings
    },
    onSuccess: (data) => {
      setSettings(data)
    }
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings) => {
      const response = await api.put('/admin/system/settings', updatedSettings)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['systemSettings'])
      toast.success('Settings updated successfully')
      setIsSaving(false)
    },
    onError: () => {
      toast.error('Failed to update settings')
      setIsSaving(false)
    }
  })

  const handleSaveSettings = () => {
    setIsSaving(true)
    updateSettingsMutation.mutate(settings)
  }

  const handleInputChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'server', label: 'Server', icon: Server }
  ]

  if (isLoading) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure platform-wide settings</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar Navigation */}
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="card">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Name</label>
                  <input
                    type="text"
                    value={settings.general?.platformName || ''}
                    onChange={(e) => handleInputChange('general', 'platformName', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Platform URL</label>
                  <input
                    type="url"
                    value={settings.general?.platformUrl || ''}
                    onChange={(e) => handleInputChange('general', 'platformUrl', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <input
                    type="email"
                    value={settings.general?.supportEmail || ''}
                    onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Maintenance Mode</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.general?.maintenanceMode || false}
                      onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">
                      Enable maintenance mode (only admins can access)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security?.sessionTimeout || 60}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password Requirements</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.security?.passwordRequirements?.uppercase || false}
                        onChange={(e) => handleInputChange('security', 'passwordRequirements', {
                          ...settings.security?.passwordRequirements,
                          uppercase: e.target.checked
                        })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Require uppercase letters</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.security?.passwordRequirements?.numbers || false}
                        onChange={(e) => handleInputChange('security', 'passwordRequirements', {
                          ...settings.security?.passwordRequirements,
                          numbers: e.target.checked
                        })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Require numbers</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.security?.passwordRequirements?.symbols || false}
                        onChange={(e) => handleInputChange('security', 'passwordRequirements', {
                          ...settings.security?.passwordRequirements,
                          symbols: e.target.checked
                        })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Require symbols</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Two-Factor Authentication</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.security?.twoFactorEnabled || false}
                      onChange={(e) => handleInputChange('security', 'twoFactorEnabled', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">
                      Enable 2FA for all admin accounts
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Configure default notification preferences
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        These settings apply to all new users by default
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email notifications for new registrations</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.emailNewRegistrations || false}
                      onChange={(e) => handleInputChange('notifications', 'emailNewRegistrations', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email notifications for events</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.emailEvents || false}
                      onChange={(e) => handleInputChange('notifications', 'emailEvents', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Push notifications enabled</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.pushEnabled || false}
                      onChange={(e) => handleInputChange('notifications', 'pushEnabled', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Add more tab contents as needed */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings