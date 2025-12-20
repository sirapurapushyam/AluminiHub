// src/utils/dateUtils.js
export const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return d.toLocaleDateString('en-IN', options)
}

export const formatDateOnly = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  }
  
  return d.toLocaleDateString('en-IN', options)
}