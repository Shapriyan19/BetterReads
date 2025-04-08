import React, { useState, useRef, useEffect } from 'react';
import './BookClubChat.css';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';
import { FiSend, FiTrash2, FiCheck, FiCheckCircle } from 'react-icons/fi';

const BookClubChat = ({ clubId }) => {
  const [messages, setMessages] = useState([
    {
      text: "Welcome to the book club chat!",
      username: "System",
      timestamp: new Date(),
      isSystem: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const { authUser } = useAuthStore();
  
  // Mock user for demo (will be replaced with authUser)
  const user = authUser || {
    _id: "1",
    username: "You"
  };

  // Fetch messages from the backend
  useEffect(() => {
    const fetchMessages = async () => {
      if (!clubId) return;
      
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/messages/club/${clubId}`);
        
        if (response.data.success) {
          const formattedMessages = response.data.data.map(msg => ({
            _id: msg._id,
            text: msg.text,
            userId: msg.senderId._id,
            username: `${msg.senderId.firstName} ${msg.senderId.lastName}`,
            timestamp: new Date(msg.createdAt),
            status: 'sent' // Default status
          }));
          
          setMessages(prev => [
            prev[0], // Keep the welcome message
            ...formattedMessages
          ]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [clubId]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:5001');

    // Join the club's chat room
    if (clubId) {
      socketRef.current.emit('join_club_chat', clubId);
    }

    // Listen for incoming messages
    socketRef.current.on('receive_message', (data) => {
      // Check if message already exists to prevent duplicates
      setMessages(prev => {
        // Check if message with this ID already exists
        const messageExists = prev.some(msg => msg._id === data._id);
        if (messageExists) return prev;
        
        return [...prev, {
          _id: data._id,
          text: data.text,
          userId: data.userId,
          username: data.username,
          timestamp: new Date(data.timestamp),
          status: data.userId === user._id ? 'sent' : 'received'
        }];
      });
    });

    // Listen for message deletion events
    socketRef.current.on('message_deleted', (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // Cleanup on unmount
    return () => {
      if (clubId) {
        socketRef.current.emit('leave_club_chat', clubId);
      }
      socketRef.current.disconnect();
    };
  }, [clubId]);

  // Handle right-click on messages
  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    
    // Show context menu for all messages except system messages
    const message = messages.find(msg => msg._id === messageId);
    if (message && !message.isSystem) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        messageId: messageId
      });
    }
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => {
      setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Handle message deletion
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await axiosInstance.delete(`/messages/${messageId}`);
      
      if (response.data.success) {
        // Message will be removed from the UI via socket event
        toast.success('Message deleted');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete message';
      toast.error(errorMessage);
    } finally {
      setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Only scroll to bottom when new messages are added, not when messages are deleted
  useEffect(() => {
    // Check if messages were added (not deleted)
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    
    // Update the previous messages length
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Handle key press in input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Send message function
  const sendMessage = async () => {
    if (newMessage.trim() && socketRef.current) {
      try {
        setIsSending(true);
        
        // Save message to backend
        const response = await axiosInstance.post('/messages', {
          text: newMessage,
          clubId: clubId
        });

        if (response.data.success) {
          // Don't add the message to local state here
          // It will be added when received through the socket
          setNewMessage('');
          
          // Ensure input stays focused
          setTimeout(() => {
            inputRef.current?.focus();
          }, 10);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = error.response?.data?.message || 'Failed to send message';
        const errorDetails = error.response?.data?.error || '';
        toast.error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render message status indicator
  const renderMessageStatus = (message) => {
    if (message.isSystem || message.userId !== user._id) return null;
    
    return (
      <span className="message-status">
        {message.status === 'sent' && <FiCheck />}
        {message.status === 'delivered' && <FiCheckCircle />}
        {message.status === 'read' && <FiCheckCircle className="read" />}
      </span>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {isLoading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`message ${
                message.isSystem ? 'system' :
                message.userId === user._id ? 'sent' : 'received'
              }`}
              onContextMenu={(e) => !message.isSystem && handleContextMenu(e, message._id)}
            >
              <div className="message-content">
                {!message.isSystem && (
                  <div className="message-username">{message.username}</div>
                )}
                <div className="message-text">{message.text}</div>
                <div className="message-footer">
                  <div className="message-timestamp">
                    {formatTime(message.timestamp instanceof Date 
                      ? message.timestamp 
                      : new Date(message.timestamp))}
                  </div>
                  {renderMessageStatus(message)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-form">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="chat-input"
          disabled={isSending}
        />
        <button 
          onClick={sendMessage} 
          className="send-button" 
          disabled={isSending || !newMessage.trim()}
          type="button"
        >
          <FiSend />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed', 
            top: contextMenu.y, 
            left: contextMenu.x,
            zIndex: 1000
          }}
        >
          <div 
            className="context-menu-item"
            onClick={() => handleDeleteMessage(contextMenu.messageId)}
          >
            <FiTrash2 style={{ marginRight: '8px' }} />
            Delete Message
          </div>
        </div>
      )}
    </div>
  );
};

export default BookClubChat; 