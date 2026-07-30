// frontend/src/pages/Income.jsx

import React, { useState, useEffect } from 'react'
import { getIncome, createIncome, updateIncome, deleteIncome } from '../services/api.js'

function Income() {
  const [incomeList, setIncomeList] = useState([])
  const [editingIncome, setEditingIncome] = useState(null)
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

  // If editingIncome changes, populate form
  useEffect(() => {
    if (editingIncome) {
      // BUG FIX: Use the raw date part directly to avoid UTC-shift issues.
      // new Date(isoString).toISOString().split('T')[0] can return the previous day
      // in timezones east of UTC when the stored time is near midnight UTC.
      let formattedDate = new Date().toISOString().split('T')[0]
      if (editingIncome.date) {
        const datePart = String(editingIncome.date).split('T')[0]
        const d = new Date(datePart + 'T00:00:00') // parse as local time
        if (!isNaN(d.getTime())) {
          formattedDate = datePart
        }
      }
      setFormData({
        title: editingIncome.title || '',
        amount: editingIncome.amount || '',
        date: formattedDate,
      })
    }
  }, [editingIncome])

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
        title: formData.title,
        amount: parseFloat(formData.amount),
        // BUG FIX: Append T00:00:00 to parse the date as local time (not UTC).
        // Plain YYYY-MM-DD strings are treated as UTC midnight by the Date constructor,
        // causing off-by-one-day errors in timezones east of UTC.
        date: new Date(formData.date + 'T00:00:00').toISOString(),
      }

      if (editingIncome) {
        await updateIncome(editingIncome.id, incomeData)
        setEditingIncome(null)
      } else {
        await createIncome(incomeData)
      }
      
      // Reset form
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      })
      
      // Refresh the list
      await fetchIncome()
    } catch (err) {
      console.error('Failed to save income:', err)
      alert(err.response?.data?.detail || 'Failed to save income')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this income entry?')) {
      return
    }

    try {
      await deleteIncome(id)
      await fetchIncome()
    } catch (err) {
      console.error('Failed to delete income:', err)
      alert(err.response?.data?.detail || 'Failed to delete income')
    }
  }

  function handleEditClick(income) {
    setEditingIncome(income)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingIncome(null)
    setFormData({
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const [datePart] = String(dateStr).split('T')
    if (datePart && datePart.includes('-')) {
      const parts = datePart.split('-')
      if (parts.length === 3) {
        const [year, month, day] = parts
        return `${day}/${month}/${year}`
      }
    }
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
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

      {/* Income Form — Add or Edit */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editingIncome ? 'Edit Income' : 'Add Income'}
        </h2>
        
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

          {/* Submit & Cancel Buttons */}
          <div className="md:col-span-3 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {submitting ? (editingIncome ? 'Updating...' : 'Adding...') : (editingIncome ? 'Update Income' : 'Add Income')}
            </button>

            {editingIncome && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            )}
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
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
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
                      {formatDate(income.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(income)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
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