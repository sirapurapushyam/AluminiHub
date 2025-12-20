import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Search, MessageSquare, Users } from 'lucide-react'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import MessageBubble from '../components/messages/MessageBubble'
import { useAuth } from '../context/AuthContext'
import { messageService } from '../services/messages'
import { userService } from '../services/users'
import useSocket from '../hooks/useSocket'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const MessagesPage = () => {
  const { user, token } = useAuth()
  const [searchParams] = useSearchParams()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [readMessageIds, setReadMessageIds] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const messagesEndRef = useRef(null)
  const queryClient = useQueryClient()
  const socket = useSocket()

  const targetUserId = searchParams.get('user')

  // Fetch conversations
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations()
  })

  // Fetch messages for the selected conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation?._id],
    queryFn: () => messageService.getUserMessages(selectedConversation._id, token),
    enabled: !!selectedConversation
  })

  // Update local messages state when selectedConversation or messagesData changes
  useEffect(() => {
    console.log('Online users:', onlineUsers);
    if (messagesData?.messages) {
      setMessages(messagesData.messages)
      // Fix: For sent messages, mark as read if receiver has read; for received, if current user has read
      setReadMessageIds(
        messagesData.messages
          .filter(m => {
            if (m.sender._id === user._id) {
              // Sent by me: read if receiver has read
              return m.readBy && m.readBy.some(r => r.user === m.receiver._id)
            } else {
              // Received: read if I have read
              return m.readBy && m.readBy.some(r => r.user === user._id)
            }
          })
          .map(m => m._id)
      );
    } else {
      setMessages([])
      setReadMessageIds([])
    }
  }, [selectedConversation, messagesData, user._id])

  // Auto-select conversation if user ID is in URL
  useEffect(() => {
    const selectConversation = async () => {
      if (!conversationsData) return;
 
      const existingConversation = conversationsData.conversations.find(
        (conv) => conv._id === targetUserId
      );
 
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        // If no conversation exists, fetch user data to create a temporary one
        try {
          const { user: newContact } = await userService.getUserProfile(targetUserId);
          const newConversation = {
            _id: newContact._id,
            firstName: newContact.firstName,
            lastName: newContact.lastName,
            profileImage: newContact.profile?.profileImage,
            role: newContact.role,
            isNew: true, // Flag to identify this as a temporary conversation
          };
          setSelectedConversation(newConversation);
        } catch (error) {
          toast.error("Could not find user to message.");
        }
      }
    };

    if (targetUserId && conversationsData) {
      selectConversation();
    }
  }, [targetUserId, conversationsData])

  // Scroll to bottom when messages or selected conversation change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

  // Listen for new messages, online users, and read receipts
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        console.log('Received newMessage event:', newMessage);
        if (
          selectedConversation && (
            selectedConversation._id === newMessage.sender._id ||
            selectedConversation._id === newMessage.receiver._id
          )
        ) {
          setMessages((prev) => [...prev, newMessage]);
        }
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        if (newMessage.sender._id !== user._id) {
          toast.success(`New message from ${newMessage.sender.firstName}`);
        }
      };

      const handleOnlineUsers = (userIds) => {
        setOnlineUsers(userIds);
      };

      const handleMessageRead = ({ messageId, readerId, readAt }) => {
        // Update local messages state with new readBy info
        setMessages(prevMsgs => {
          const updatedMsgs = prevMsgs.map(m => {
            if (m._id === messageId) {
              // Avoid duplicate entries
              const alreadyRead = m.readBy && m.readBy.some(r => r.user === readerId);
              return {
                ...m,
                readBy: alreadyRead
                  ? m.readBy
                  : [...(m.readBy || []), { user: readerId, readAt }]
              };
            }
            return m;
          });
          // Recalculate readMessageIds for UI
          setReadMessageIds(
            updatedMsgs
              .filter(m => {
                if (m.sender._id === user._id) {
                  // Sent by me: read if receiver has read
                  return m.readBy && m.readBy.some(r => r.user === m.receiver._id)
                } else {
                  // Received: read if I have read
                  return m.readBy && m.readBy.some(r => r.user === user._id)
                }
              })
              .map(m => m._id)
          );
          return updatedMsgs;
        });
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('getOnlineUsers', handleOnlineUsers);
      socket.on('messageRead', handleMessageRead);
      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('getOnlineUsers', handleOnlineUsers);
        socket.off('messageRead', handleMessageRead);
      };
    }
  }, [socket, selectedConversation, queryClient, user._id, messages]);
  // Emit read receipt for all unread messages when chat is opened
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && socket) {
      messages.forEach(msg => {
        if (msg.receiver._id === user._id && (!msg.readBy || !msg.readBy.some(r => r.user === user._id))) {
          // Mark as read via API (triggers backend socket event)
          messageService.markAsRead(msg._id);
        }
      });
    }
  }, [selectedConversation, messages, socket, user._id]);

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => messageService.sendMessage(messageData),
    onSuccess: () => {
      setMessageText('')
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?._id] });
    }
  })

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (messageText.trim() && selectedConversation) {
      sendMessageMutation.mutate({ content: messageText, receiverId: selectedConversation._id })
    }
  }

  const ConversationItem = ({ conversation }) => {
    const isSelected = selectedConversation?._id === conversation._id
    const isOnline = onlineUsers.includes(conversation._id)
    return (
      <button
        onClick={() => setSelectedConversation(conversation)}
        className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left ${
          isSelected ? 'bg-primary-50 border-l-4 border-primary-600' : ''
        }`}
      >
        <div className="relative">
          <img
            src={conversation.profileImage || `https://ui-avatars.com/api/?name=${conversation.firstName}+${conversation.lastName}`}
            alt={conversation.firstName}
            className="w-12 h-12 rounded-full"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <p className="font-medium text-gray-900 truncate">
              {conversation.firstName} {conversation.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{conversation.role?.replace('_', ' ')}</p>
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
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="p-4 text-center"><LoadingSpinner /></div>
            ) : conversationsData?.conversations?.length > 0 || (selectedConversation && selectedConversation.isNew) ? (
              <>
                {selectedConversation && selectedConversation.isNew && !conversationsData.conversations.some(c => c._id === selectedConversation._id) && (
                  <ConversationItem key={selectedConversation._id} conversation={selectedConversation} />
                )}
                {conversationsData.conversations
                  .filter(conv => {
                    if (!searchQuery) return true;
                    const fullName = `${conv.firstName} ${conv.lastName}`.toLowerCase();
                    return fullName.includes(searchQuery.toLowerCase());
                  })
                  .map(conv => (
                    <ConversationItem key={conv._id} conversation={conv} />
                  ))
                }
              </>
            ) : (
              <EmptyState 
                icon={Users}
                title="No Conversations"
                description="Start a conversation from the directory to see it here."
              />
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            (() => { const otherUser = selectedConversation; return ( // Using IIFE to easily access otherUser
            <>
              {/* Chat Header */}
              <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={otherUser.profileImage || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}`}
                    alt={otherUser.firstName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      {otherUser.firstName} {otherUser.lastName}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{otherUser.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingMessages && !messagesData ? (
                  <div className="flex justify-center"><LoadingSpinner /></div>
                ) : messages.length > 0 ? (
                  <>
                    {messages.map(message => (
                      <MessageBubble
                        key={message._id}
                        message={message}
                        isOwn={message.sender._id === user._id}
                        isRead={readMessageIds.includes(message._id)}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <EmptyState 
                    icon={MessageSquare}
                    title="No messages yet"
                    description="Send a message to start the conversation."
                  />
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sendMessageMutation.isLoading}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
            )})()
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the list to start messaging"
            />
          )}
        </div>
      </div>
    </Layout>
  )
}

export default MessagesPage