// frontend/src/components/DashboardCard.jsx

import React from 'react'

function DashboardCard({ title, amount, color = 'blue' }) {
  // Map color names to Tailwind classes
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  }

  // Get the classes for the provided color, default to blue if not found
  const classes = colorClasses[color] || colorClasses.blue

  return (
    <div className={`rounded-lg border p-6 shadow-sm ${classes}`}>
      <h3 className="text-sm font-medium uppercase tracking-wide opacity-80">
        {title}
      </h3>
      <p className="mt-2 text-3xl font-bold">
        {/* Format amount to 2 decimal places with currency symbol */}
        ₹{Number(amount).toFixed(2)}
      </p>
    </div>
  )
}

export default DashboardCard