// src/components/common/EmptyState.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 rounded-full p-6">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {action && (
        action.href ? (
          <Link to={action.href} className="btn-primary">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary">
            {action.label}
          </button>
        )
      )}
    </div>
  )
}

export default EmptyState