import React, { useState } from 'react';
import './BookClubDetails.css';
import BookClubChat from './BookClubChat';
import { FaTimes, FaCrown, FaUsers, FaLock, FaUserCircle, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useClubStore } from '../store/useClubStore';

const GENRE_OPTIONS = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy',
  'Romance', 'Thriller', 'Biography', 'History', 'Self-Help',
  'Poetry', 'Drama', 'Horror', 'Adventure', 'Comedy'
];

const BookClubDetails = ({ isOwner = false, isMember = false, club, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [clubName, setClubName] = useState(club?.name || '');
  const [description, setDescription] = useState(club?.description || '');
  const [clubImage, setClubImage] = useState(club?.image || null);
  const [genres, setGenres] = useState(club?.genres || []);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateClub, deleteClub, leaveClub } = useClubStore();

  const handleAddGenre = () => {
    if (selectedGenre && !genres.includes(selectedGenre)) {
      setGenres([...genres, selectedGenre]);
      setSelectedGenre('');
    }
  };

  const handleRemoveGenre = (genreToRemove) => {
    setGenres(genres.filter(genre => genre !== genreToRemove));
  };

  const handleUpdateClub = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', clubName);
      formData.append('description', description);
      formData.append('genres', JSON.stringify(genres));
      
      // Only append image if it's a new file
      if (clubImage instanceof File) {
        formData.append('image', clubImage);
      } else if (clubImage) {
        // If it's a string (existing image URL), append it as is
        formData.append('image', clubImage);
      }

      // Debug: Log FormData contents
      console.log('Sending update with FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const result = await updateClub(club._id, formData);
      console.log('Update result:', result);
      
      toast.success('Club settings updated successfully!');
      onClose(); // Close the modal to refresh the parent component
    } catch (error) {
      console.error('Error updating club:', error);
      toast.error(error.response?.data?.message || 'Failed to update club settings');
    }
  };

  const handleDeleteClub = async () => {
    try {
      await deleteClub(club._id);
      onClose(); // Close the modal after successful deletion
    } catch (error) {
      console.error('Error deleting club:', error);
      toast.error(error.response?.data?.message || 'Failed to delete club');
    }
  };

  const handleLeaveClub = async () => {
    try {
      await leaveClub(club._id);
      // Close the modal after successfully leaving the club
      onClose();
    } catch (error) {
      console.error('Error leaving club:', error);
      // Don't show error toast here as it's already shown in the store
    }
  };

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

            {isMember && !isOwner && (
              <div className="club-info-section">
                <button 
                  className="leave-club-button"
                  onClick={handleLeaveClub}
                >
                  <FaSignOutAlt /> Leave Club
                </button>
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
                const userName = role.user?.firstName && role.user?.lastName ? 
                               `${role.user.firstName} ${role.user.lastName}` : 
                               'Unknown User';
                
                return (
                  <div key={index} className="member-item">
                    <div className="member-avatar">
                      {role.user?.profilePic ? (
                        <img 
                          src={role.user.profilePic} 
                          alt={userName} 
                          className="profile-pic"
                        />
                      ) : (
                        <FaUserCircle className="default-avatar" />
                      )}
                    </div>
                    <div className="member-info">
                      <span className="member-name">{userName}</span>
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
            <BookClubChat clubId={club._id} />
          </div>
        );
      case 'settings':
        return (
          <div className="tab-panel settings-panel">
            <h3>Edit Club Settings</h3>
            <form onSubmit={handleUpdateClub}>
              <div className="form-group">
                <label>Club Name</label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Club Image</label>
                <div className="image-upload-container">
                  <label className="image-upload-label">
                    <div className="upload-icon">
                      <FiUpload />
                    </div>
                    <span>Click to upload new club image</span>
                    <p className="file-format-info">Accepted formats: JPG, PNG, GIF (max 5MB)</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 5 * 1024 * 1024) {
                          toast.error('Image size must be less than 5MB');
                          e.target.value = '';
                          return;
                        }
                        setClubImage(file);
                      }}
                    />
                  </label>
                  {clubImage && <p className="file-name">Selected: {clubImage.name}</p>}
                </div>
              </div>

              <div className="form-group">
                <label>Genres</label>
                <div className="genre-input-container">
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="genre-select"
                  >
                    <option value="">Select a genre</option>
                    {GENRE_OPTIONS.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={handleAddGenre} 
                    disabled={!selectedGenre}
                    className="add-genre-button"
                  >
                    Add
                  </button>
                </div>
                <div className="genre-tags">
                  {genres.map((genre, index) => (
                    <span key={index} className="genre-tag">
                      {genre}
                      <button
                        type="button"
                        className="remove-genre"
                        onClick={() => handleRemoveGenre(genre)}
                        aria-label={`Remove ${genre}`}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="update-button">
                  Update Club Settings
                </button>
                <button 
                  type="button" 
                  className="delete-button"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <FaTrash /> Delete Club
                </button>
              </div>
            </form>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="confirmation-overlay" onClick={() => setShowDeleteConfirm(false)}>
                <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
                  <h3>Delete Club</h3>
                  <p>Are you sure you want to delete this club? All data will be lost and this action cannot be undone.</p>
                  <div className="confirmation-buttons">
                    <button 
                      className="confirm-delete"
                      onClick={handleDeleteClub}
                    >
                      Yes, Delete Club
                    </button>
                    <button 
                      className="cancel-delete"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
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
