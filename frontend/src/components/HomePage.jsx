import React, { useState, useEffect } from "react"; 
import "./HomePage.css"; 
import { useNavigate } from "react-router-dom";
import {Search, User, Loader2 } from "lucide-react";
import singaporeMap from "../assets/SingaporeMapFrame.webp";
import Rating from '@mui/material/Rating';
import bookCover from "../assets/placeholder.jpg";
import { useAuthStore } from "../store/useAuthStore";
import { useBookStore } from "../store/useBookStore";
import toast from "react-hot-toast";

export default function HomePage () {
    const { logout, authUser } = useAuthStore();
    const { recommendedBooks, getRecommendedBooks, getBookDetails, isLoading, isLoadingDetails } = useBookStore();
    
    /* displaying availability */
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [availability, setAvailability] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [rating, setRating] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [displayedBooks, setDisplayedBooks] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (authUser?.email) {
            getRecommendedBooks(authUser.email)
                .then(books => {
                    console.log('Received books:', books);
                    // Log the first book's data structure
                    if (books.length > 0) {
                        console.log('First book data:', books[0]);
                        console.log('First book subjects:', books[0].subject);
                    }
                    setDisplayedBooks(books);
                })
                .catch(error => {
                    console.error('Error loading recommended books:', error);
                });
        }
    }, [authUser?.email]);

    useEffect(() => {
        if (searchTerm.length > 2) {
            // Implement search functionality here
            console.log("Would fetch from backend with:", searchTerm);
        }
    }, [searchTerm]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    const handleBCL = () => {
        navigate('/bcl');
    };

    const filteredBooks = displayedBooks.filter((book) => {
        const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            book.author_name?.[0]?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const formattedSubject = book.primary_subject
            ? book.primary_subject
                .split('_')
                .join(' ')
                .split('/')
                .join(' & ')
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            : 'Uncategorized';
        
        const matchesCategory = selectedCategory === "All" || formattedSubject === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    const openModal = async (book) => {
        try {
            setSelectedBook(book);
            const isbn = book.isbn?.[0] || book.isbn_13?.[0] || book.isbn_10?.[0];
            if (isbn) {
                const bookDetails = await getBookDetails(isbn);
                setSelectedBook(prev => ({
                    ...prev,
                    ...bookDetails
                }));
            } else {
                console.log('No ISBN available for this book');
                toast.error('Book details not available - ISBN missing');
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
            toast.error('Failed to load book details');
        }
    };

    const closeModal = () => {
        setSelectedBook(null);
    };

    useEffect(() => {
        const modal = document.querySelector('.modal');
        if (modal) {
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }, [selectedBook]);

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="home-title">Bookshelf</div>

                <div className="search-bar-group">
                    <div className="search-container">
                        <input 
                            type="search" 
                            placeholder="Search for a book..." 
                            className="search-input" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="search-icon"/>
                    </div>
                    <select 
                        className="category-filter" 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {[...new Set(displayedBooks.map(book => 
                            book.primary_subject
                                ? book.primary_subject
                                    .split('_')
                                    .join(' ')
                                    .split('/')
                                    .join(' & ')
                                    .toLowerCase()
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')
                                : 'Uncategorized'
                        ))].sort().map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="user-actions">
                    <button className="profile-icon" onClick={handleProfile}>
                        <User size={20} />
                    </button>
                    <button className="bookclub-button" onClick={handleBCL}>
                        My Book Club
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </header>

            <main className="main-section">
                <h1 className="section-title">Recommended Books</h1>
                {isLoading ? (
                    <div className="loading-container">
                        <Loader2 className="animate-spin" size={24} />
                        <p>Loading recommended books...</p>
                    </div>
                ) : (
                    <div className="grid-container">
                        {filteredBooks.map((book) => {
                            // console.log('Rendering book:', book.title, 'subjects:', book.subject);
                            return (
                                <div key={book.key} className="card">
                                    <img 
                                        src={book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : bookCover} 
                                        alt={book.title} 
                                        className="card-img" 
                                    />
                                    <div className="card-body">
                                        <h3 className="book-title">{book.title}</h3>
                                        <p className="book-author">{book.author_name?.[0] || 'Unknown Author'}</p>
                                    </div>
                                    <div className="card-footer">
                                        <span className="category-badge">
                                            {book.primary_subject
                                                ? book.primary_subject
                                                    .split('_')
                                                    .join(' ')
                                                    .split('/')
                                                    .join(' & ')
                                                    .toLowerCase()
                                                    .split(' ')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')
                                                : 'Uncategorized'}
                                        </span>
                                        <button className="details-button" onClick={() => openModal(book)}>
                                            Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {selectedBook && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <span className="close-icon" onClick={closeModal}>&times;</span>
                        <div className="modal-columns">
                            {isLoadingDetails ? (
                                <div className="modal-content loading-container">
                                    <Loader2 className="animate-spin" size={24} />
                                    <p>Loading book details...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="modal-left">
                                        <img 
                                            src={selectedBook.cover_i ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg` : bookCover} 
                                            alt={selectedBook.title} 
                                            className="details-img" 
                                        />
                                        <div className="library-dropdown">
                                            <select
                                                value={selectedBranch}
                                                onChange={(e) => setSelectedBranch(e.target.value)}
                                                className="branch-select"
                                            >
                                                <option value="">View Availability</option>
                                                {branches.map((branch) => {
                                                    const match = availability.find((a) => a.BranchName === branch.Name);
                                                    const count = match?.AvailableCount ?? 0;
                                                    return (
                                                        <option key={branch.ID} value={branch.ID}>
                                                            {branch.Name} — {count} available
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <button className="view-map-button" onClick={() => setMapModalOpen(true)}>
                                                View Locations
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="modal-content">
                                        <h2>{selectedBook.title}</h2>
                                        <p><strong>Author:</strong> {selectedBook.author_name?.[0] || selectedBook.authors?.[0]?.name || 'Unknown Author'}</p>
                                        <p><strong>First Published:</strong> {selectedBook.first_publish_year || selectedBook.first_publish_date || 'Unknown'}</p>
                                        <p><strong>Categories:</strong> {selectedBook.subject?.join(', ') || selectedBook.subjects?.join(', ') || 'Uncategorized'}</p>
                                        <p><strong>ISBN:</strong> {selectedBook.isbn?.[0] || selectedBook.isbn_13?.[0] || selectedBook.isbn_10?.[0] || 'Not available'}</p>
                                        
                                        {rating && (
                                            <div className="total-book-rating">
                                                <Rating name="read-only" value={rating} readOnly />
                                                <span className="rating-text">{rating} out of 5</span>
                                            </div>
                                        )}
                                        
                                        <p><strong>Description:</strong></p>
                                        <p>{selectedBook.description?.value || selectedBook.description || 'No description available.'}</p>
                                        
                                        <div className="rating-container">
                                            <h3 className="modal-label"><strong>Give a Rating:</strong></h3>
                                            <Rating
                                                name="simple-controlled"
                                                value={rating}
                                                onChange={(event, newValue) => {
                                                    setRating(newValue);
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="review-container">
                                            <h3 className="modal-label"><strong>Make a Review:</strong></h3>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {mapModalOpen && (
                <div className="modal-overlay" onClick={() => setMapModalOpen(false)}>
                    <div className="modal show" onClick={(e) => e.stopPropagation()}>
                        <span className="close-icon" onClick={() => setMapModalOpen(false)}>&times;</span>
                        <h2>Library Branch Locations</h2>
                        <img src={singaporeMap} alt="Map of Singapore" className="map-image" />
                        <p>Availability is listed in the dropdown above.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
