import React, { useState } from 'react';
import './BookClubDetails.css';
import { useNavigate } from 'react-router-dom';
import BookClubChat from './BookClubChat';

const BookClubDetails = ({ isOwner = false }) => {
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="tab-panel">
            <h2>The Literary Circle</h2>
            <p>Description: A cozy corner for lovers of fiction and classics to gather, read, and reflect.</p>
            <p>Suggested Books:</p>
            <ul>
              <li>Pride and Prejudice</li>
              <li>1984</li>
              <li>The Great Gatsby</li>
            </ul>
          </div>
        );
      case 'members':
        return (
          <div className="tab-panel">
            <h3>Member List</h3>
            <ul>
              <li>@alice</li>
              <li>@bob</li>
              <li>@charlie</li>
            </ul>
          </div>
        );
      case 'chat':
        return (
          <div className="tab-panel">
            <h3>Club Chat</h3>
            <BookClubChat />
          </div>
        );
      case 'settings':
        return (
          <div className="tab-panel">
            <h3>Edit Club Settings</h3>
            <p>(Editable form placeholder like Club Creator page)</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="club-details-overlay" onClick={() => navigate('/bcl')}>
      <div
        className="club-details-card"
        onClick={(e) => e.stopPropagation()} // prevents bubbling
      >
        <div className="tabs">
          <div className={activeTab === 'details' ? 'tab active' : 'tab'} onClick={() => setActiveTab('details')}>Club Details</div>
          <div className={activeTab === 'members' ? 'tab active' : 'tab'} onClick={() => setActiveTab('members')}>Members</div>
          <div className={activeTab === 'chat' ? 'tab active' : 'tab'} onClick={() => setActiveTab('chat')}>Chat</div>
          {isOwner && (
            <div className={activeTab === 'settings' ? 'tab active' : 'tab'} onClick={() => setActiveTab('settings')}>Settings</div>
          )}
        </div>
        <div className="tab-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default BookClubDetails;
