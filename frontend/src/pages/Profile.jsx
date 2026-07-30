// frontend/src/pages/Profile.jsx

import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function Profile() {
  const { user } = useAuth()

  // If user data hasn't loaded yet
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          My Profile
        </h1>

        {/* Profile Avatar Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Full Name
            </label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-medium">
              {user.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email Address
            </label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-medium">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              User ID
            </label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-600 font-mono text-sm">
              #{user.id}
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Your profile information is read-only. Contact support if you need to update your details.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Profile