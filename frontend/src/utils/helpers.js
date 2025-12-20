export const getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const getRoleColor = (role) => {
  const colors = {
    student: 'green',
    alumni: 'blue',
    faculty: 'purple',
    college_admin: 'red',
    super_admin: 'gray',
  }
  return colors[role] || 'gray'
}

export const getRoleBadgeClass = (role) => {
  const classes = {
    student: 'bg-green-100 text-green-800',
    alumni: 'bg-blue-100 text-blue-800',
    faculty: 'bg-purple-100 text-purple-800',
    college_admin: 'bg-red-100 text-red-800',
    super_admin: 'bg-gray-100 text-gray-800',
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

export const getEventTypeBadgeClass = (type) => {
  const classes = {
    seminar: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    reunion: 'bg-purple-100 text-purple-800',
    networking: 'bg-orange-100 text-orange-800',
    cultural: 'bg-pink-100 text-pink-800',
    sports: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

export const getJobTypeBadgeClass = (type) => {
  const classes = {
    full_time: 'bg-blue-100 text-blue-800',
    part_time: 'bg-green-100 text-green-800',
    internship: 'bg-purple-100 text-purple-800',
    contract: 'bg-orange-100 text-orange-800',
    freelance: 'bg-pink-100 text-pink-800',
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

export const generateCollegeCode = (collegeName) => {
  const words = collegeName.toUpperCase().split(' ')
  const code = words.map(word => word.charAt(0)).join('').slice(0, 3)
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${code}${randomNum}`
}

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (file) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']
  const extension = getFileExtension(file.name).toLowerCase()
  return imageExtensions.includes(extension)
}

export const calculateReadingTime = (text) => {
  const wordsPerMinute = 200
  const numberOfWords = text.split(/\s/g).length
  const minutes = numberOfWords / wordsPerMinute
  return Math.ceil(minutes)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const sortByKey = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1
    } else {
      return a[key] < b[key] ? 1 : -1
    }
  })
}

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {})
}