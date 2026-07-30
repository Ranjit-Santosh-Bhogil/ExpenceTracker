// frontend/src/pages/Expenses.jsx

import React, { useState, useEffect } from 'react'
import ExpenseForm from '../components/ExpenseForm.jsx'
import ExpenseTable from '../components/ExpenseTable.jsx'
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/api.js'

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // BUG FIX: formKey forces ExpenseForm to remount (and reset) after a successful add
  const [formKey, setFormKey] = useState(0)

  // Fetch all expenses on page load
  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    try {
      setLoading(true)
      const response = await getExpenses()
      setExpenses(response.data)
      setError('')
    } catch (err) {
      console.error('Failed to fetch expenses:', err)
      setError('Failed to load expenses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle creating a new expense
  async function handleAddExpense(expenseData) {
    try {
      await createExpense(expenseData)
      await fetchExpenses() // Refresh the list
      // BUG FIX: Bump formKey so ExpenseForm remounts and its fields are cleared
      setFormKey(prev => prev + 1)
    } catch (err) {
      console.error('Failed to add expense:', err)
      alert(err.response?.data?.detail || 'Failed to add expense')
    }
  }

  // Handle updating an existing expense
  async function handleUpdateExpense(expenseData) {
    if (!editingExpense) return

    try {
      await updateExpense(editingExpense.id, expenseData)
      setEditingExpense(null) // Clear edit mode
      await fetchExpenses() // Refresh the list
    } catch (err) {
      console.error('Failed to update expense:', err)
      alert(err.response?.data?.detail || 'Failed to update expense')
    }
  }

  // Handle deleting an expense
  async function handleDeleteExpense(id) {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      await deleteExpense(id)
      await fetchExpenses() // Refresh the list
    } catch (err) {
      console.error('Failed to delete expense:', err)
      alert(err.response?.data?.detail || 'Failed to delete expense')
    }
  }

  // Start editing an expense
  function handleEditClick(expense) {
    setEditingExpense(expense)
    // Scroll to top so the form is visible
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel editing
  function handleCancelEdit() {
    setEditingExpense(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Expenses</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Expense Form — Add or Edit */}
      {/* BUG FIX: key={formKey} forces a remount (and full state reset) after a successful add */}
      <ExpenseForm
        key={formKey}
        onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
        initialData={editingExpense}
        onCancel={editingExpense ? handleCancelEdit : null}
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading expenses...</div>
        </div>
      ) : (
        /* Expense Table */
        <ExpenseTable
          expenses={expenses}
          onEdit={handleEditClick}
          onDelete={handleDeleteExpense}
        />
      )}
    </div>
  )
}

export default Expenses