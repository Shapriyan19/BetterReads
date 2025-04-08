import React, { useState } from 'react';
import './BookClubDetails.css';
import BookClubChat from './BookClubChat';
import { FaTimes, FaCrown, FaUsers, FaLock } from 'react-icons/fa';

const BookClubDetails = ({ isOwner = false, isMember = false, club, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  const renderTabContent = () => {
    if (!club) {
      return (
        <div className="error-container">
          <p>Club data not available</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'details':
        return (
          <div className="tab-panel details-panel">
            {!isMember && !isOwner && (
              <div className="non-member-banner">
                <FaLock className="lock-icon" />
                <div className="banner-text">
                  <h3>Club Preview</h3>
                  <p>Join this club to access all features and discussions</p>
                </div>
              </div>
            )}
            <div className="club-header">
              <h2>{club.name}</h2>
              <div className="club-stats">
                <div className="stat-item">
                  <FaUsers className="stat-icon" />
                  <span>
                    {(club.membersCount || club.roles?.length || 0)} 
                    {(club.membersCount === 1 || club.roles?.length === 1) ? ' member' : ' members'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="club-info-section">
              <h3>About</h3>
              <p className="description">{club.description}</p>
            </div>

            <div className="club-info-section">
              <h3>Admin</h3>
              <div className="admin-info">
                <FaCrown className="admin-icon" />
                <span>{club.adminName}</span>
              </div>
            </div>

            <div className="club-info-section">
              <h3>Genres</h3>
              <div className="genre-tags">
                {club.genres?.map((genre, index) => (
                  <span key={index} className="genre-tag">{genre}</span>
                ))}
              </div>
            </div>

            {club.books && club.books.length > 0 && (
              <div className="club-info-section">
                <h3>Suggested Books</h3>
                <div className="books-list">
                  {club.books.map((book, index) => (
                    <div key={index} className="book-item">
                      <span className="book-title">{book}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'members':
        return (
          <div className="tab-panel members-panel">
            <h3>Members</h3>
            <div className="members-list">
              {club.roles?.map((role, index) => {
                // Handle different role structures
                const userName = role.userName || 
                               (role.user?.firstName && role.user?.lastName ? 
                                `${role.user.firstName} ${role.user.lastName}` : 
                                'Unknown User');
                
                const userInitials = role.user?.firstName?.[0] || 
                                   (userName !== 'Unknown User' ? userName[0] : '?');
                
                return (
                  <div key={index} className="member-item">
                    <div className="member-avatar">
                      {userInitials}
                    </div>
                    <div className="member-info">
                      <span className="member-name">
                        {userName}
                      </span>
                      <div className={`member-role ${role.role === 'admin' ? 'admin' : ''}`}>
                        {role.role === 'admin' && <FaCrown className="role-icon" />}
                        <span>{role.role === 'admin' ? 'Admin' : 'Member'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
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
