import React, { useState, useEffect } from 'react';
import './BookClubListing.css';
import { useNavigate } from 'react-router-dom';
import { useClubStore } from '../store/useClubStore';
import { useAuthStore } from '../store/useAuthStore';
import { FiUpload } from 'react-icons/fi';
import { FiChevronLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import BookClubDetails from './BookClubDetails';

const GENRE_OPTIONS = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Thriller',
  'Horror',
  'Historical Fiction',
  'Biography',
  'Self-Help',
  'Poetry',
  'Drama',
  'Adventure',
  'Children\'s Literature',
  'Young Adult',
  'Classic Literature',
  'Contemporary Literature'
];

const BookClubListing = () => {
  const navigate = useNavigate();
  const { clubs, userClubs, isLoading, error, getClubs, createClub, getUserClubs, getClub, joinClub } = useClubStore();
  const { authUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyClubs, setShowMyClubs] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    genres: [],
    adminName: '',
    roles: []
  });
  const [selectedGenre, setSelectedGenre] = useState('');
  const [clubName, setClubName] = useState('');
  const [clubImage, setClubImage] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [isLoadingClub, setIsLoadingClub] = useState(false);

  // Fetch both all clubs and user clubs on component mount
  useEffect(() => {
    const fetchData = async () => {
      await getClubs();
      if (authUser) {
        await getUserClubs();
      }
    };
    fetchData();
  }, [getClubs, getUserClubs, authUser]);

  useEffect(() => {
    console.log('Current user state:', authUser);
  }, [authUser]);

  useEffect(() => {
    console.log('Clubs data updated:', clubs);
  }, [clubs]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreateClub = async () => {
    try {
        if (!authUser) {
            console.error('User not logged in');
            toast.error('Please log in to create a club');
            return;
        }

        // Validate required fields
        if (!clubName.trim()) {
            toast.error('Club name is required');
            return;
        }

        if (!description.trim()) {
            toast.error('Description is required');
            return;
        }

        // Create FormData object to handle file upload
        const formData = new FormData();
        
        // Add basic club info as strings
        formData.append('name', clubName.trim());
        formData.append('description', description.trim());
        formData.append('adminName', `${authUser.firstName} ${authUser.lastName}`);

        // Add genres as a JSON string
        const genres = Array.isArray(newClub.genres) ? newClub.genres : [];
        formData.append('genres', JSON.stringify(genres));

        // Add roles as a JSON string
        const roles = [{
            role: 'admin',
            user: authUser._id
        }];
        formData.append('roles', JSON.stringify(roles));

        // Add image if it exists and is valid
        if (clubImage && clubImage instanceof File) {
            // Validate image size (5MB limit)
            if (clubImage.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            formData.append('image', clubImage, clubImage.name);
        }

        // Debug: Log FormData contents
        for (let [key, value] of formData.entries()) {
            console.log(`FormData: ${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }

        try {
            const result = await createClub(formData);
            
            if (result.success) {
                toast.success('Club created successfully!');
                // Reset form
                setShowCreateModal(false);
                setClubName('');
                setDescription('');
                setClubImage(null);
                setNewClub({ 
                    name: '', 
                    description: '', 
                    genres: [],
                    adminName: '',
                    roles: []
                });
                
                // Refresh both all clubs and user clubs
                await getClubs();
                if (authUser) {
                    await getUserClubs();
                }
            }
        } catch (error) {
            console.error('Error from createClub:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create club. Please try again.';
            toast.error(errorMessage);
            throw error;
        }
    } catch (error) {
        console.error('Error in handleCreateClub:', error);
        toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleAddGenre = () => {
    if (selectedGenre && !newClub.genres.includes(selectedGenre)) {
      setNewClub(prev => ({
        ...prev,
        genres: [...prev.genres, selectedGenre]
      }));
      setSelectedGenre('');
    }
  };

  const handleRemoveGenre = (genreToRemove) => {
    setNewClub(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  // Filter clubs based on search query
  const filteredClubs = Array.isArray(showMyClubs ? userClubs : clubs) ? 
    (showMyClubs ? userClubs : clubs).filter(club => 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

  console.log('Filtered clubs:', filteredClubs);

  const handleEnterClub = (e, club) => {
    e.stopPropagation();
    const isMember = club.roles?.some(role => role.user._id === authUser?._id);
    const isAdmin = club.adminName === `${authUser?.firstName} ${authUser?.lastName}`;
    if (isMember || isAdmin) {
      setIsLoadingClub(true);
      // Always fetch the complete club data to ensure we have the latest information
      getClub(club._id).then(fullClubData => {
        setSelectedClub(fullClubData);
        setIsLoadingClub(false);
      }).catch(error => {
        console.error('Error fetching club details:', error);
        toast.error('Failed to load club details');
        setIsLoadingClub(false);
      });
    }
  };

  const handleApplyToClub = async (clubId) => {
    try {
        await joinClub(clubId);
    } catch (error) {
        console.error('Error joining club:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="book-club-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading Book Clubs</h2>
          <p>Please wait while we fetch the latest clubs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="book-club-page">
      <div className="book-club-listing">
        <button className="back-button" onClick={handleBack}>
          <FiChevronLeft /> Back
        </button>

        <div className="action-buttons">
          {authUser && (
            <>
              <button 
                className={`my-clubs-btn ${showMyClubs ? 'active' : ''}`} 
                onClick={() => setShowMyClubs(!showMyClubs)}
              >
                {showMyClubs ? 'All Clubs' : 'My Book Clubs'}
              </button>
              <button className="create-club-btn" onClick={() => setShowCreateModal(true)}>
                Create Club
              </button>
            </>
          )}
        </div>

        <h1>Book Clubs</h1>
        <p>Discover and join online book discussion forums that match your reading interests. Connect with fellow readers and participate in thoughtful literary conversations.</p>

        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search book clubs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <p>Showing {filteredClubs.length} book clubs</p>

        <div className="book-clubs-grid">
          {filteredClubs.map((club) => (
            <div
              key={club._id}
              className="book-club-item"
              onClick={() => setSelectedClub(club)}
            >
              <div 
                className="club-image"
                style={{
                  backgroundImage: club.image 
                    ? `url(${club.image})` 
                    : 'url(/default-club-image.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
              <div className="club-details">
                <h2>{club.name}</h2>
                <p>{club.description}</p>
                <p>{club.membersCount} {club.membersCount === 1 ? 'member' : 'members'}</p>
                <div className="genre-tags">
                  {club.genres?.map((genre, index) => (
                    <span key={index} className="genre-tag">{genre}</span>
                  ))}
                </div>
                {(() => {
                  if (showMyClubs) {
                    return (
                      <button 
                        className="join-button joined"
                        onClick={(e) => handleEnterClub(e, club)}
                      >
                        Enter Club
                      </button>
                    );
                  }

                  const isMember = club.roles?.some(role => role.user._id === authUser?._id);
                  const isAdmin = club.adminName === `${authUser?.firstName} ${authUser?.lastName}`;
                  
                  if (!authUser) {
                    return (
                      <button 
                        className="join-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.error('Please log in to join clubs');
                        }}
                      >
                        Join as member
                      </button>
                    );
                  } else if (isMember || isAdmin) {
                    return (
                      <button 
                        className="join-button joined"
                        onClick={(e) => handleEnterClub(e, club)}
                      >
                        Enter Club
                      </button>
                    );
                  } else if (club.applications?.includes(authUser._id)) {
                    return <span className="applied-text">Application Pending...</span>;
                  } else {
                    return (
                      <button 
                        className="join-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyToClub(club._id);
                        }}
                      >
                        Join as member
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedClub && (
        <BookClubDetails 
          isOwner={selectedClub.adminName === `${authUser?.firstName} ${authUser?.lastName}`}
          isMember={selectedClub.roles?.some(role => role.user._id === authUser?._id)}
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
        />
      )}

      {isLoadingClub && (
        <div className="loading-overlay">
          <div className="loading-message">Loading club details...</div>
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content create-club-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create a New Book Club</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateClub();
            }}>
              <div className="form-group">
                <label>Club Name</label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  required
                />
              </div>

              <div className="image-upload-container">
                <label className="image-upload-label">
                  <div className="upload-icon">
                    <FiUpload />
                  </div>
                  <span>Click to upload club image</span>
                  <p className="file-format-info">Accepted formats: JPG, PNG, GIF (max 5MB)</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
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

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
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
                  {newClub.genres.map((genre, index) => (
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
                <button type="submit" className="create-button">
                    Create Club
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)}>
                    Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookClubListing;