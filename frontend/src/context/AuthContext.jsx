// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api.js'

// Create the context object
const AuthContext = createContext(null)

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail
  if (!detail) {
    return error.message === 'Network Error'
      ? 'Cannot reach the server. Make sure the backend is running on port 8000.'
      : fallback
  }
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(', ')
  }
  return fallback
}

export function AuthProvider({ children }) {
  // Store the JWT token
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  
  // Store the current user object
  const [user, setUser] = useState(null)
  
  // Track loading state (useful for showing spinners while checking auth)
  const [loading, setLoading] = useState(true)

  // Whenever token changes, update localStorage and fetch user profile
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      fetchUser()
    } else {
      localStorage.removeItem('token')
      setUser(null)
      setLoading(false)
    }
  }, [token])

  async function fetchUser() {
    try {
      const response = await api.get('/me')
      setUser(response.data)
    } catch (error) {
      // Token is invalid or expired
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    try {
      const response = await api.post('/login', { email, password })
      const newToken = response.data.access_token
      localStorage.setItem('token', newToken)
      setToken(newToken)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Login failed')
      }
    }
  }

  async function register(name, email, password) {
    try {
      await api.post('/register', { name, email, password })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Registration failed')
      }
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // Value object that will be available to all consuming components
  const value = {
    user,
    token,
    login,
    logout,
    register,
    isAuthenticated: !!token,  // !! converts to boolean: true if token exists
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context easily
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}