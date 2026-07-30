// frontend/src/components/ProtectedRoute.jsx

import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    )
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If authenticated, render the child route component
  return <Outlet />
}

export default ProtectedRoute