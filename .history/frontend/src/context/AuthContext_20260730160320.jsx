// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// Create the context object
const AuthContext = createContext(null)

// Base URL for all API requests
const API_URL = 'http://localhost:8000'

// Configure axios defaults
axios.defaults.baseURL = API_URL

export function AuthProvider({ children }) {
  // Store the JWT token
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  
  // Store the current user object
  const [user, setUser] = useState(null)
  
  // Track loading state (useful for showing spinners while checking auth)
  const [loading, setLoading] = useState(true)

  // Whenever token changes, update axios headers and localStorage
  useEffect(() => {
    if (token) {
      // Set the Authorization header for ALL future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
      
      // Fetch current user profile
      fetchUser()
    } else {
      // Remove the header if no token
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
      setUser(null)
      setLoading(false)
    }
  }, [token])

  async function fetchUser() {
    try {
      const response = await axios.get('/me')
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
      const response = await axios.post('/login', { email, password })
      setToken(response.data.access_token)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Login failed'
      }
    }
  }

  async function register(name, email, password) {
    try {
      await axios.post('/register', { name, email, password })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Registration failed'
      }
    }
  }

  function logout() {
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