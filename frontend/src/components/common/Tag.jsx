import React from 'react'
import { X } from 'lucide-react'

const Tag = ({ 
  text, 
  onRemove, 
  variant = 'primary',
  size = 'md',
  removable = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-green-50 text-green-700 hover:bg-green-100',
    warning: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium transition-colors
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
    >
      {text}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-black/10 focus:outline-none"
        >
          <X className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
        </button>
      )}
    </span>
  )
}

export default Tag