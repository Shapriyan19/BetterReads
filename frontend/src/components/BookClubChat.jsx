import React, { useState, useRef, useEffect } from 'react';
import './BookClubChat.css';

const BookClubChat = () => {
  const [messages, setMessages] = useState([
    {
      text: "Welcome to the book club chat!",
      username: "System",
      timestamp: new Date(),
      isSystem: true
    },
    {
      text: "Has anyone started reading chapter 1?",
      username: "Alice",
      userId: "2",
      timestamp: new Date(Date.now() - 50000),
    },
    {
      text: "Yes! I'm loving it so far",
      username: "Bob",
      userId: "3",
      timestamp: new Date(Date.now() - 40000),
    },
    {
      text: "The character development is amazing",
      username: "Alice",
      userId: "2",
      timestamp: new Date(Date.now() - 30000),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Mock user for demo
  const user = {
    _id: "1",
    username: "You"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        text: newMessage,
        userId: user._id,
        username: user.username,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
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
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default BookClubChat; 