import React, { useState, useRef, useEffect } from 'react';
import './BookClubChat.css';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';

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
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
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
            timestamp: new Date(msg.createdAt)
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
          timestamp: new Date(data.timestamp)
        }];
      });
    });

    // Cleanup on unmount
    return () => {
      if (clubId) {
        socketRef.current.emit('leave_club_chat', clubId);
      }
      socketRef.current.disconnect();
    };
  }, [clubId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
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
            >
              <div className="message-content">
                {!message.isSystem && (
                  <div className="message-username">{message.username}</div>
                )}
                <div className="message-text">{message.text}</div>
                <div className="message-timestamp">
                  {message.timestamp instanceof Date 
                    ? message.timestamp.toLocaleTimeString() 
                    : new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          disabled={isSending}
        />
        <button type="submit" className="send-button" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default BookClubChat; 