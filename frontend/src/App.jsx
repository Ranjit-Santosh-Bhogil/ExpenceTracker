// frontend/src/App.jsx

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Expenses from './pages/Expenses.jsx'
import Income from './pages/Income.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  return (
    <AuthProvider>
      {/* AuthProvider wraps everything so all components can access login state */}
      <div className="min-h-screen bg-gray-100">
        {/* Navbar is always visible, but it changes based on auth state */}
        <Navbar />
        
        {/* Main content area with padding */}
        <main className="container mx-auto px-4 py-6">
          <Routes>
            {/* Public routes — anyone can access */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes — only logged-in users can access */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/income" element={<Income />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App