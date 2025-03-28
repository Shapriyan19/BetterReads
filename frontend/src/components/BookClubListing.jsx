import React from 'react';
import './BookClubListing.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const BookClubListing = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const bookClubs = [
    {
      id: 1,
      name: 'The Literary Circle',
      description: 'We discuss classic literature and contemporary fiction with a focus on character development...',
      members: 24,
      genre: ['Fiction', 'Classics', 'Contemporary'],
    },
    {
      id: 2,
      name: 'Sci-Fi Explorers',
      description: 'Exploring new worlds and technologies through science fiction literature. Join our discussions...',
      members: 18,
      genre: ['Science Fiction', 'Fantasy'],
    },
    {
      id: 3,
      name: 'Mystery Lovers',
      description: 'For those who enjoy solving puzzles and unraveling mysteries in literature. Our forum is...',
      members: 15,
      genre: ['Mystery', 'Thriller', 'Crime'],
    },
    // Add more book clubs as needed...
  ];

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="book-club-page">
      <div className="book-club-listing">
        <button className="back-button" onClick={handleBack}>
          &lt; Back
        </button>

        <h1>Book Clubs</h1>
        <p>Discover and join online book discussion forums that match your reading interests. Connect with fellow readers and participate in thoughtful literary conversations.</p>

        <div className="search-bar">
          <input type="text" placeholder="Search book clubs..." />
        </div>

        <p>Showing {bookClubs.length} book clubs</p>

        <div className="book-clubs-grid">
          {bookClubs.map((club) => (
            <div className="book-club-item" key={club.id}>
              <div className="club-image"></div>
              <div className="club-details">
                <h2>{club.name}</h2>
                <p>{club.description}</p>
                <p>{club.members} members</p>
                <div className="genre-tags">
                  {club.genre.map((tag, index) => (
                    <span key={index} className="genre-tag">{tag}</span>
                  ))}
                </div>
                <button className="join-button">
                  {club.name === 'Sci-Fi Explorers' ? 'Apply to Join' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookClubListing;