import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

const SearchBar = ({ placeholder = "Search...", onSearch, value: externalValue, className = "" }) => {
  const [value, setValue] = useState(externalValue || '')

  useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue)
    }
  }, [externalValue])

  const handleChange = (e) => {
    setValue(e.target.value)
    if (onSearch) {
      onSearch(e.target.value)
    }
  }

  const handleClear = () => {
    setValue('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      <input 
        type="text" 
        value={value} 
        onChange={handleChange} 
        placeholder={placeholder} 
        className="input pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm sm:text-base" 
      />
      {value && (
        <button 
          onClick={handleClear} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  )
}

export default SearchBar