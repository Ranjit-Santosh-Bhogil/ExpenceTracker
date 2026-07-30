// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardCard from '../components/DashboardCard.jsx'
import { getDashboard } from '../services/api.js'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch dashboard data when the component mounts
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await getDashboard()
        setDashboardData(response.data)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, []) // Empty dependency array = run only once when component mounts

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading dashboard...</div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <DashboardCard
          title="Total Income"
          amount={dashboardData.total_income}
          color="green"
        />
        <DashboardCard
          title="Total Expense"
          amount={dashboardData.total_expense}
          color="red"
        />
        <DashboardCard
          title="Current Balance"
          amount={dashboardData.current_balance}
          color="blue"
        />
      </div>

      {/* Recent Expenses Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
          <Link
            to="/expenses"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {dashboardData.recent_expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No expenses yet.{' '}
            <Link to="/expenses" className="text-blue-600 hover:text-blue-800">
              Add your first expense
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-4 text-sm font-semibold text-gray-600">Title</th>
                  <th className="py-2 px-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="py-2 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="py-2 px-4 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm text-gray-800">{expense.title}</td>
                    <td className="py-2 px-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm font-medium text-gray-800">
                      ₹{Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard