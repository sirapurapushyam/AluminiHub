import React from 'react'
import { formatDistanceToNow } from 'date-fns'

const ConversationList = ({ conversations, selectedId, onSelect }) => {
  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUser || conversation
        const isSelected = selectedId === conversation._id
        
        return (
          <button
            key={conversation._id}
            onClick={() => onSelect(conversation)}
            className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left ${
              isSelected ? 'bg-primary-50 border-l-4 border-primary-600' : ''
            }`}
          >
            <div className="relative">
              <img
                src={otherUser.profileImage || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}`}
                alt={otherUser.firstName}
                className="w-12 h-12 rounded-full"
              />
              {otherUser.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="font-medium text-gray-900 truncate">
                  {otherUser.firstName} {otherUser.lastName}
                </p>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              {conversation.lastMessage && (
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
            {conversation.unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ConversationList