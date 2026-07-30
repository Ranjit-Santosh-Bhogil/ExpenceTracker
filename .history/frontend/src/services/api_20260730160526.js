// frontend/src/services/api.js

import axios from 'axios'

// Base URL for all API requests
// Change this if your backend runs on a different port or domain
const API_BASE_URL = 'http://localhost:8000'

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ==========================
// AUTH API
// ==========================

export const registerUser = (userData) => {
  return api.post('/register', userData)
}

export const loginUser = (credentials) => {
  return api.post('/login', credentials)
}

export const getCurrentUser = () => {
  return api.get('/me')
}

// ==========================
// EXPENSE API
// ==========================

export const getExpenses = (params = {}) => {
  return api.get('/expenses', { params })
}

export const createExpense = (expenseData) => {
  return api.post('/expenses', expenseData)
}

export const updateExpense = (id, expenseData) => {
  return api.put(`/expenses/${id}`, expenseData)
}

export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`)
}

// ==========================
// INCOME API
// ==========================

export const getIncome = () => {
  return api.get('/income')
}

export const createIncome = (incomeData) => {
  return api.post('/income', incomeData)
}

// ==========================
// DASHBOARD API
// ==========================

export const getDashboard = () => {
  return api.get('/dashboard')
}

export default api