import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Check, CheckCheck } from 'lucide-react'

const MessageBubble = ({ message, isOwn, isRead }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && (
        <img
          src={message.sender?.profile?.profileImage || `https://ui-avatars.com/api/?name=${message.sender?.firstName}+${message.sender?.lastName}`}
          alt={message.sender?.firstName}
          className="w-8 h-8 rounded-full mr-3"
        />
      )}
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
        <div className={`flex items-center mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
          {isOwn && (
            <span className="ml-2">
              {isRead
                ? <CheckCheck className="w-4 h-4 text-blue-500" />
                : <Check className="w-4 h-4" />}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble