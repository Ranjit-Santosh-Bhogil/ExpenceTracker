// frontend/src/pages/Income.jsx

import React, { useState, useEffect } from 'react'
import { getIncome, createIncome } from '../services/api.js'

function Income() {
  const [incomeList, setIncomeList] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Fetch income entries on page load
  useEffect(() => {
    fetchIncome()
  }, [])

  async function fetchIncome() {
    try {
      setLoading(true)
      const response = await getIncome()
      setIncomeList(response.data)
      setError('')
    } catch (err) {
      console.error('Failed to fetch income:', err)
      setError('Failed to load income data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Validation
    if (!formData.title.trim() || !formData.amount) {
      alert('Please fill in all required fields')
      return
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than zero')
      return
    }

    try {
      setSubmitting(true)
      
      // Prepare data for API
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      }

      await createIncome(incomeData)
      
      // Reset form
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      })
      
      // Refresh the list
      await fetchIncome()
    } catch (err) {
      console.error('Failed to add income:', err)
      alert(err.response?.data?.detail || 'Failed to add income')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Income</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Add Income Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Income</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Salary, Freelance"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Submit Button — full width on mobile, auto on desktop */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>

      {/* Income List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Income History</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading income...</div>
          </div>
        ) : incomeList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No income entries yet. Add your first income above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {incomeList.map((income) => (
                  <tr key={income.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{income.title}</td>
                    <td className="py-3 px-4 text-sm font-medium text-green-600">
                      +₹{Number(income.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(income.date).toLocaleDateString()}
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

export default Income