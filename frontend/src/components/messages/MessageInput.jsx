import React, { useState, useRef } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'

const MessageInput = ({ onSendMessage, onSendFile, disabled }) => {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)
  const { socket } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && onSendMessage && !disabled) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0 && onSendFile) {
      onSendFile(files)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 border-t bg-white">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        disabled={disabled}
      >
        <Paperclip className="w-5 h-5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        disabled={disabled}
      />
      
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  )
}

export default MessageInput