import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'

const StatsCard = ({ icon: Icon, label, value, change, trend, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    red: 'bg-red-600'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card p-4 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colors[color]} rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2 text-xs sm:text-sm">
              {trend === 'up' ? (
                <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1" />
              ) : trend === 'down' ? (
                <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mr-1" />
              ) : null}
              <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard