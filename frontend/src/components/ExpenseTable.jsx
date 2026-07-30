// frontend/src/components/ExpenseTable.jsx

import React, { useState } from 'react'

function ExpenseTable({ expenses, onEdit, onDelete }) {
  // Local state for search, filter, and sort
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('date')

  // Helper to format dates cleanly without timezone shift issues
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

  // Filter and sort expenses
  const filteredExpenses = (expenses || [])
    .filter((expense) => {
      if (!expense) return false
      // Search by title (case-insensitive)
      const title = expense.title ? String(expense.title) : ''
      const matchesSearch = title.toLowerCase().includes((search || '').toLowerCase())
      // Filter by category
      const matchesCategory = categoryFilter ? expense.category === categoryFilter : true
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'date') {
        return new Date(b.date || 0) - new Date(a.date || 0) // Newest first
      }
      if (sortBy === 'amount') {
        return (b.amount || 0) - (a.amount || 0) // Highest first
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '') // A-Z
      }
      return 0
    })

  // Get unique categories from expenses for the filter dropdown
  const categories = [...new Set((expenses || []).map(e => e.category).filter(Boolean))]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Search, Filter, and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No expenses found.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{expense.title}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">
                    ₹{Number(expense.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(expense.date)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {expense.description || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExpenseTable