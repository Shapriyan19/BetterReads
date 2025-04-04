import React, { useState } from 'react';
import './BookClubDetails.css';
import BookClubChat from './BookClubChat';

const BookClubDetails = ({ isOwner = false, isMember = false, club, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="tab-panel">
            <h2>{club.name}</h2>
            <p>Description: {club.description}</p>
            <p>Admin: {club.adminName}</p>
            <p>Members: {club.membersCount}</p>
            <p>Genres:</p>
            <ul>
              {club.genres?.map((genre, index) => (
                <li key={index}>{genre}</li>
              ))}
            </ul>
            {club.books && (
              <>
                <p>Suggested Books:</p>
                <ul>
                  {club.books.map((book, index) => (
                    <li key={index}>{book}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        );
      case 'members':
        return (
          <div className="tab-panel">
            <h3>Member List</h3>
            <ul>
              {club.roles?.map((role, index) => (
                <li key={index}>@{role.userName} {role.role === 'admin' ? '(Admin)' : ''}</li>
              ))}
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
    <div className="club-details-overlay" onClick={onClose}>
      <div
        className="club-details-card"
        onClick={(e) => e.stopPropagation()} // prevents bubbling
      >
        {(isOwner || isMember) ? (
          <>
            <div className="tabs">
              <div className={activeTab === 'details' ? 'tab active' : 'tab'} onClick={() => setActiveTab('details')}>Club Details</div>
              <div className={activeTab === 'members' ? 'tab active' : 'tab'} onClick={() => setActiveTab('members')}>Members</div>
              <div className={activeTab === 'chat' ? 'tab active' : 'tab'} onClick={() => setActiveTab('chat')}>Chat</div>
              {isOwner && (
                <div className={activeTab === 'settings' ? 'tab active' : 'tab'} onClick={() => setActiveTab('settings')}>Settings</div>
              )}
            </div>
            <div className="tab-content">{renderTabContent()}</div>
          </>
        ) : (
          <div className="tab-content">
            {renderTabContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookClubDetails;
