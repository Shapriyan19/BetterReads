import React, { useState, useEffect } from 'react';
import './BookClubListing.css';
import { useNavigate } from 'react-router-dom';
import { useClubStore } from '../store/useClubStore';
import { useAuthStore } from '../store/useAuthStore';
import { FiUpload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

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
  const { clubs, userClubs, isLoading, error, getClubs, createClub, getUserClubs } = useClubStore();
  const { authUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyClubs, setShowMyClubs] = useState(false);
  const [previewClub, setPreviewClub] = useState(null);
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

  const handleCreateClub = async (e) => {
    e.preventDefault();
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
        formData.append('name', clubName.trim());
        formData.append('description', description.trim());
        formData.append('genres', JSON.stringify(newClub.genres || []));
        formData.append('adminName', `${authUser.firstName} ${authUser.lastName}`);
        formData.append('roles', JSON.stringify([{ 
            role: 'admin', 
            user: authUser._id 
        }]));

        if (clubImage) {
            formData.append('image', clubImage);
        }

        // Debug: Log FormData contents
        console.log('FormData contents:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

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
            
            // Refresh the clubs list
            getClubs();
        }
    } catch (error) {
        console.error('Error creating club:', error);
        toast.error(error.response?.data?.message || 'Failed to create club. Please try again.');
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

  const handleJoinClub = async (clubId) => {
    try {
      // TODO: Implement join club functionality when membership routes are ready
      navigate(`/bookclub/${clubId}`);
    } catch (error) {
      console.error('Error joining club:', error);
    }
  };

  const handleApplyToClub = async (clubId) => {
    try {
      // TODO: Implement apply to club functionality when membership routes are ready
      console.log('Applying to club:', clubId);
    } catch (error) {
      console.error('Error applying to club:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading book clubs...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="book-club-page">
      <div className="book-club-listing">
        <button className="back-button" onClick={handleBack}>
          &lt; Back
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
              onClick={() => setPreviewClub(club)}
            >
              <div className="club-image"></div>
              <div className="club-details">
                <h2>{club.name}</h2>
                <p>{club.description}</p>
                <p>{club.membersCount} members</p>
                <div className="genre-tags">
                  {club.genres?.map((genre, index) => (
                    <span key={index} className="genre-tag">{genre}</span>
                  ))}
                </div>
                {(() => {
                  // In My Book Clubs view, always show Enter Club
                  if (showMyClubs) {
                    return (
                      <button 
                        className="join-button joined"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bookclub/${club._id}`);
                        }}
                      >
                        Enter Club
                      </button>
                    );
                  }

                  // In All Clubs view, check membership status
                  console.log('Checking membership for club:', club.name);
                  console.log('Club roles:', club.roles);
                  console.log('Auth user:', authUser?._id);
                  
                  const isMember = club.roles?.some(role => {
                    console.log('Checking role:', role);
                    const isMatch = role.user === authUser?._id;
                    console.log('Is match:', isMatch);
                    return isMatch;
                  });
                  
                  console.log('Is member:', isMember);
                  
                  if (!authUser) {
                    return (
                      <button 
                        className="join-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.error('Please log in to join clubs');
                        }}
                      >
                        Apply to Join
                      </button>
                    );
                  } else if (isMember) {
                    return (
                      <button 
                        className="join-button joined"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bookclub/${club._id}`);
                        }}
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
                        Apply to Join
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Club Modal */}
      {previewClub && (
        <div className="modal-overlay" onClick={() => setPreviewClub(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{previewClub.name}</h2>
            <p>{previewClub.description}</p>
            <p><strong>Admin:</strong> {previewClub.adminName}</p>
            <p><strong>Genres:</strong> {previewClub.genres?.join(', ')}</p>
            <p><strong>Members:</strong> {previewClub.members?.length || 0}</p>
            <p><em>You must join this club to access full features.</em></p>
            <button onClick={() => setPreviewClub(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content create-club-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create a New Book Club</h2>
            <form onSubmit={handleCreateClub}>
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setClubImage(e.target.files[0])}
                  />
                </label>
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
                  <button type="button" onClick={handleAddGenre} disabled={!selectedGenre}>
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
                      >
                        ×
                      </button>
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