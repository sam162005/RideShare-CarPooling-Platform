import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaStar, FaReply, FaSearch, FaFilter, FaExclamationCircle } from 'react-icons/fa';
import Header from '../components/Header';
import './InboxPage.css';

const InboxPage = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    unread: false,
    starred: false,
    withRides: false,
    dateRange: 'all'
  });
  const [composeMode, setComposeMode] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: ''
  });

  // Fetch messages (simulated)
  useEffect(() => {
    // In a real app, this would be an API call
    const mockMessages = [
      {
        id: 1,
        sender: 'John Doe',
        senderEmail: 'john.doe@example.com',
        subject: 'Question about your ride to Chennai',
        content: 'Hi there, I saw your ride to Chennai on May 15th. I was wondering if you still have 2 seats available? Also, do you allow medium-sized luggage? Thanks!',
        timestamp: '2025-05-14T10:30:00',
        read: false,
        starred: false,
        rideId: 'ride_123456',
        rideInfo: {
          from: 'Coimbatore',
          to: 'Chennai',
          date: '2025-05-15'
        }
      },
      {
        id: 2,
        sender: 'RideShare Team',
        senderEmail: 'support@rideshare.com',
        subject: 'Your ride has been published successfully',
        content: 'Congratulations! Your ride from Coimbatore to Bangalore has been published successfully. It is now visible to potential passengers. You will receive notifications when someone books a seat.',
        timestamp: '2025-05-13T15:45:00',
        read: true,
        starred: true,
        rideId: 'ride_789012',
        rideInfo: {
          from: 'Coimbatore',
          to: 'Bangalore',
          date: '2025-05-20'
        }
      },
      {
        id: 3,
        sender: 'Priya S',
        senderEmail: 'priya.s@example.com',
        subject: 'Booking confirmation',
        content: 'Hello, I have booked 1 seat on your ride to Mysore this weekend. Looking forward to meeting you. My phone number is 9876543210 in case you need to contact me before the ride.',
        timestamp: '2025-05-12T09:15:00',
        read: true,
        starred: false,
        rideId: 'ride_345678',
        rideInfo: {
          from: 'Coimbatore',
          to: 'Mysore',
          date: '2025-05-18'
        }
      },
      {
        id: 4,
        sender: 'Raj Kumar',
        senderEmail: 'raj.kumar@example.com',
        subject: 'Need to cancel my booking',
        content: 'I apologize, but I need to cancel my booking for your ride to Chennai tomorrow. Something urgent came up and I won\'t be able to make it. Please let me know the refund process. Sorry for the inconvenience.',
        timestamp: '2025-05-11T18:20:00',
        read: false,
        starred: false,
        rideId: 'ride_123456',
        rideInfo: {
          from: 'Coimbatore',
          to: 'Chennai',
          date: '2025-05-15'
        }
      },
      {
        id: 5,
        sender: 'RideShare Team',
        senderEmail: 'support@rideshare.com',
        subject: 'Monthly activity summary',
        content: 'Here\'s your RideShare activity for the past month:\n\n- Rides published: 3\n- Rides completed: 2\n- Total earnings: ₹2,450\n- Positive reviews: 5\n\nKeep up the good work!',
        timestamp: '2025-05-10T12:00:00',
        read: true,
        starred: false
      }
    ];
    
    setMessages(mockMessages);
  }, []);

  // Filter messages based on active tab and search term
  const filteredMessages = messages.filter(message => {
    // First filter by tab
    if (activeTab === 'inbox') {
      // Apply search filter if any
      if (searchTerm) {
        return (
          (message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
          // Apply additional filters if enabled
          (!filterOptions.unread || !message.read) &&
          (!filterOptions.starred || message.starred) &&
          (!filterOptions.withRides || message.rideId)
        );
      }
      
      // Just apply additional filters
      return (
        (!filterOptions.unread || !message.read) &&
        (!filterOptions.starred || message.starred) &&
        (!filterOptions.withRides || message.rideId)
      );
    } else if (activeTab === 'sent') {
      // In a real app, this would filter sent messages
      return false;
    } else if (activeTab === 'starred') {
      return message.starred && 
        (searchTerm ? 
          (message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.content.toLowerCase().includes(searchTerm.toLowerCase())) 
          : true);
    }
    
    return true;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Handle message selection
  const handleSelectMessage = (message) => {
    // Mark as read
    if (!message.read) {
      const updatedMessages = messages.map(m => 
        m.id === message.id ? { ...m, read: true } : m
      );
      setMessages(updatedMessages);
    }
    
    setSelectedMessage(message);
    setComposeMode(false);
  };

  // Handle starring a message
  const handleStarMessage = (e, messageId) => {
    e.stopPropagation();
    const updatedMessages = messages.map(m => 
      m.id === messageId ? { ...m, starred: !m.starred } : m
    );
    setMessages(updatedMessages);
  };

  // Handle deleting a message
  const handleDeleteMessage = (e, messageId) => {
    e.stopPropagation();
    const updatedMessages = messages.filter(m => m.id !== messageId);
    setMessages(updatedMessages);
    
    if (selectedMessage && selectedMessage.id === messageId) {
      setSelectedMessage(null);
    }
  };

  // Handle replying to a message
  const handleReply = (message) => {
    setComposeMode(true);
    setNewMessage({
      recipient: message.senderEmail,
      subject: `Re: ${message.subject}`,
      content: `\n\n------ Original Message ------\nFrom: ${message.sender}\nDate: ${formatDate(message.timestamp)}\nSubject: ${message.subject}\n\n${message.content}`
    });
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    // In a real app, this would send the message via API
    alert('Message sent successfully!');
    setComposeMode(false);
    setNewMessage({
      recipient: '',
      subject: '',
      content: ''
    });
  };

  return (
    <div className="inbox-page">
      <Header />
      
      <div className="inbox-container">
        <div className="inbox-sidebar">
          <button 
            className="compose-btn"
            onClick={() => {
              setComposeMode(true);
              setSelectedMessage(null);
              setNewMessage({
                recipient: '',
                subject: '',
                content: ''
              });
            }}
          >
            + Compose New Message
          </button>
          
          <div className="inbox-tabs">
            <div 
              className={`inbox-tab ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              <FaEnvelope />
              <span>Inbox</span>
              {messages.filter(m => !m.read).length > 0 && (
                <span className="unread-badge">{messages.filter(m => !m.read).length}</span>
              )}
            </div>
            
            <div 
              className={`inbox-tab ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              <FaEnvelopeOpen />
              <span>Sent</span>
            </div>
            
            <div 
              className={`inbox-tab ${activeTab === 'starred' ? 'active' : ''}`}
              onClick={() => setActiveTab('starred')}
            >
              <FaStar />
              <span>Starred</span>
            </div>
          </div>
        </div>
        
        <div className="inbox-content">
          <div className="inbox-header">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button 
                className="filter-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
              </button>
            </div>
            
            {showFilters && (
              <div className="filter-options">
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="unread" 
                    checked={filterOptions.unread}
                    onChange={() => setFilterOptions({...filterOptions, unread: !filterOptions.unread})}
                  />
                  <label htmlFor="unread">Unread only</label>
                </div>
                
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="starred" 
                    checked={filterOptions.starred}
                    onChange={() => setFilterOptions({...filterOptions, starred: !filterOptions.starred})}
                  />
                  <label htmlFor="starred">Starred only</label>
                </div>
                
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="withRides" 
                    checked={filterOptions.withRides}
                    onChange={() => setFilterOptions({...filterOptions, withRides: !filterOptions.withRides})}
                  />
                  <label htmlFor="withRides">With ride info only</label>
                </div>
                
                <div className="filter-option">
                  <select 
                    value={filterOptions.dateRange}
                    onChange={(e) => setFilterOptions({...filterOptions, dateRange: e.target.value})}
                  >
                    <option value="all">All time</option>
                    <option value="today">Today</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="inbox-body">
            {composeMode ? (
              <div className="compose-container">
                <h2>New Message</h2>
                <form onSubmit={handleSendMessage}>
                  <div className="form-group">
                    <label>To:</label>
                    <input 
                      type="email" 
                      value={newMessage.recipient}
                      onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Subject:</label>
                    <input 
                      type="text" 
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Message:</label>
                    <textarea 
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                      required
                      rows={10}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="send-btn">Send Message</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setComposeMode(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="message-list">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map(message => (
                      <div 
                        key={message.id}
                        className={`message-item ${!message.read ? 'unread' : ''} ${selectedMessage && selectedMessage.id === message.id ? 'selected' : ''}`}
                        onClick={() => handleSelectMessage(message)}
                      >
                        <div className="message-icon">
                          {!message.read && <div className="unread-dot"></div>}
                        </div>
                        <div className="message-sender">{message.sender}</div>
                        <div className="message-subject">{message.subject}</div>
                        <div className="message-preview">
                          {message.content.substring(0, 60)}...
                        </div>
                        <div className="message-date">{formatDate(message.timestamp)}</div>
                        <div className="message-actions">
                          <FaStar 
                            className={`star-icon ${message.starred ? 'starred' : ''}`}
                            onClick={(e) => handleStarMessage(e, message.id)}
                          />
                          <FaTrash 
                            className="delete-icon"
                            onClick={(e) => handleDeleteMessage(e, message.id)}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-messages">
                      <FaExclamationCircle size={48} />
                      <p>No messages found</p>
                      {searchTerm && <p>Try adjusting your search or filters</p>}
                    </div>
                  )}
                </div>
                
                {selectedMessage && (
                  <div className="message-detail">
                    <div className="message-detail-header">
                      <h2>{selectedMessage.subject}</h2>
                      <div className="message-detail-actions">
                        <button onClick={() => handleReply(selectedMessage)}>
                          <FaReply /> Reply
                        </button>
                        <button onClick={(e) => handleDeleteMessage(e, selectedMessage.id)}>
                          <FaTrash /> Delete
                        </button>
                        <button onClick={(e) => handleStarMessage(e, selectedMessage.id)}>
                          <FaStar className={selectedMessage.starred ? 'starred' : ''} /> 
                          {selectedMessage.starred ? 'Unstar' : 'Star'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="message-detail-info">
                      <div className="sender-info">
                        <strong>From:</strong> {selectedMessage.sender} &lt;{selectedMessage.senderEmail}&gt;
                      </div>
                      <div className="date-info">
                        <strong>Date:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    {selectedMessage.rideInfo && (
                      <div className="ride-info-card">
                        <h3>Ride Information</h3>
                        <div className="ride-details">
                          <div className="ride-route">
                            <strong>Route:</strong> {selectedMessage.rideInfo.from} to {selectedMessage.rideInfo.to}
                          </div>
                          <div className="ride-date">
                            <strong>Date:</strong> {new Date(selectedMessage.rideInfo.date).toLocaleDateString()}
                          </div>
                          <button className="view-ride-btn" onClick={() => alert('Navigating to ride details...')}>
                            View Ride Details
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="message-content">
                      {selectedMessage.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
