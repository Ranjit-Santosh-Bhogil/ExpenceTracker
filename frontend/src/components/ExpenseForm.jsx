// frontend/src/components/ExpenseForm.jsx

import React, { useState, useEffect } from 'react'

function ExpenseForm({ onSubmit, initialData = null, onCancel = null }) {
  // Form state — pre-fill with initialData if editing, otherwise empty
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date (YYYY-MM-DD)
    description: '',
  })

  // Track whether this is the initial mount to avoid redundant state reset
  const mountedRef = React.useRef(false)

  // If initialData changes (e.g., user clicks "Edit" or cancels edit), update the form
  useEffect(() => {
    if (initialData) {
      // BUG FIX: Append 'T00:00:00' to force local-time parsing.
      // Without this, bare YYYY-MM-DD strings are parsed as UTC midnight,
      // which can shift the displayed date by one day in timezones east of UTC.
      let formattedDate = new Date().toISOString().split('T')[0]
      if (initialData.date) {
        const rawDate = String(initialData.date)
        // If the string has a time component, strip it; parse as local time
        const datePart = rawDate.split('T')[0]
        const d = new Date(datePart + 'T00:00:00')
        if (!isNaN(d.getTime())) {
          formattedDate = datePart
        }
      }
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || '',
        date: formattedDate,
        description: initialData.description || '',
      })
    } else if (mountedRef.current) {
      // BUG FIX: Reset the form when edit is cancelled (initialData becomes null).
      // Guard with mountedRef to skip the redundant call on initial mount.
      setFormData({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      })
    }
    mountedRef.current = true
  }, [initialData])

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault() // Prevent page reload

    // Basic validation
    if (!formData.title.trim() || !formData.amount || !formData.category.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than zero')
      return
    }

    // Convert amount to number and date to ISO string before sending
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      // BUG FIX: Append T00:00:00 to parse the date as local time (not UTC).
      // Plain YYYY-MM-DD strings are treated as UTC by the Date constructor,
      // which can cause off-by-one-day errors in timezones east of UTC.
      date: new Date(formData.date + 'T00:00:00').toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {initialData ? 'Edit Expense' : 'Add Expense'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="e.g., Grocery Shopping"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills">Bills</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description — full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional details..."
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          {initialData ? 'Update Expense' : 'Add Expense'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default ExpenseForm