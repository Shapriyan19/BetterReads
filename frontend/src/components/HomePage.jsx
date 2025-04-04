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
import { Dialog, DialogTitle, DialogContent, Box, Typography } from '@mui/material';

export default function HomePage () {
    const { logout, authUser } = useAuthStore();
    const { recommendedBooks, getRecommendedBooks, getBookDetails, searchBooks, isLoading, isLoadingDetails, getReviews, postReview, postRating, getAverageRating, bookReviews, isLoadingReviews, averageRating, totalRatings } = useBookStore();
    
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
    const [isSearching, setIsSearching] = useState(false);
    const [recommendedBooksLoaded, setRecommendedBooksLoaded] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (authUser?.email && !recommendedBooksLoaded) {
            getRecommendedBooks(authUser.email)
                .then(books => {
                    console.log('Received books:', books);
                    if (books.length > 0) {
                        console.log('First book data:', books[0]);
                        console.log('First book subjects:', books[0].subject);
                    }
                    setDisplayedBooks(books);
                    setRecommendedBooksLoaded(true);
                })
                .catch(error => {
                    console.error('Error loading recommended books:', error);
                });
        }
    }, [authUser?.email, recommendedBooksLoaded]);

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
        setSelectedBook(book);
        setOpen(true);
        try {
            const isbn = book.isbn?.[0] || book.isbn_13?.[0] || book.isbn_10?.[0];
            if (isbn) {
                const bookDetails = await getBookDetails(isbn);
                setSelectedBook(prev => ({
                    ...prev,
                    ...bookDetails
                }));
            }

            await Promise.all([
                getReviews(book.title),
                getAverageRating(book.title)
            ]);
        } catch (error) {
            console.error('Error fetching book data:', error);
            if (!isbn) {
                toast.error('Book details not available - ISBN missing');
            }
        }
    };

    const handleClose = () => {
        setSelectedBook(null);
        setOpen(false);
    };

    useEffect(() => {
        const modal = document.querySelector('.modal');
        if (modal) {
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }, [selectedBook]);

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length === 0) {
            setIsSearching(false);
            // Use the stored recommended books instead of fetching again
            if (recommendedBooksLoaded) {
                setDisplayedBooks(recommendedBooks);
            }
        } else {
            setIsSearching(true);
        }
    };

    const handleSearch = async () => {
        if (searchTerm.length > 2) {
            try {
                setIsSearching(true);
                const searchResults = await searchBooks(searchTerm);
                console.log('Search results:', searchResults);
                
                if (searchResults && searchResults.length > 0) {
                    setDisplayedBooks(searchResults);
                    setSelectedCategory("All");
                } else {
                    setDisplayedBooks([]);
                    toast.error('No books found');
                }
            } catch (error) {
                console.error('Error searching books:', error);
                toast.error('Failed to search books');
                setDisplayedBooks([]);
            }
        } else {
            toast.error('Please enter at least 3 characters to search');
        }
    };

    const handleSubmit = async () => {
        if (!rating) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            // If there's review text, submit both rating and review
            if (reviewText.trim() !== "") {
                const reviewData = {
                    firstname: authUser.firstName || "",
                    lastname: authUser.lastName || "",
                    bookName: selectedBook.title,
                    profilePic: authUser.profilePic || "",
                    stars: rating,
                    review: reviewText
                };
                
                await postReview(reviewData);
                toast.success("Review submitted successfully!");
                setReviewText("");
            } else {
                // If no review text, just submit the rating
                const ratingData = {
                    userName: authUser.firstName + authUser.lastName,
                    bookName: selectedBook.title,
                    stars: rating
                };
                await postRating(ratingData);
                toast.success("Rating submitted successfully!");
            }
            
            // Refresh reviews and average rating
            await Promise.all([
                getReviews(selectedBook.title),
                getAverageRating(selectedBook.title)
            ]);
            
        } catch (error) {
            console.error("Error submitting:", error);
            toast.error(error.response?.data?.message || "Failed to submit");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            onChange={handleSearchInputChange}
                        />
                        <button 
                            className="search-button"
                            onClick={handleSearch}
                        >
                            <Search size={16} />
                        </button>
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
                        Book Clubs
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </header>

            <main className="main-section">
                <h1 className="section-title">{isSearching ? "Search Results" : "Recommended Books"}</h1>
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
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <span className="close-icon" onClick={handleClose}>&times;</span>
                        {isLoadingDetails ? (
                            <div className="modal-content loading-container">
                                <Loader2 className="animate-spin" size={24} />
                                <p>Loading book details...</p>
                            </div>
                        ) : (
                            <div className="modal-columns">
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
                                    <p><strong>Categories:</strong></p>
                                    <div className="categories-container">
                                        {(selectedBook.subject || selectedBook.subjects || ['Uncategorized'])
                                            .slice(0, showAllCategories ? undefined : 3)
                                            .map((category, index) => (
                                                <span key={index} className="modal-category-badge">
                                                    {category}
                                                </span>
                                            ))}
                                        {(selectedBook.subject?.length > 3 || selectedBook.subjects?.length > 3) && (
                                            <span 
                                                className="view-more-text"
                                                onClick={() => setShowAllCategories(!showAllCategories)}
                                            >
                                                {showAllCategories ? 'show less' : 'view more'}
                                            </span>
                                        )}
                                    </div>
                                    <p><strong>ISBN:</strong> {selectedBook.isbn?.[0] || selectedBook.isbn_13?.[0] || selectedBook.isbn_10?.[0] || 'Not available'}</p>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                                        <Rating 
                                            value={averageRating} 
                                            precision={0.5} 
                                            readOnly 
                                        />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                                        </Typography>
                                    </Box>
                                    
                                    <p><strong>Description:</strong></p>
                                    <div className="description-section">
                                        <p>{selectedBook.description?.value || selectedBook.description || 'No description available.'}</p>
                                    </div>
                                    
                                    <div className="rating-container">
                                        <h3 className="modal-label"><strong>Rate this book:</strong></h3>
                                        <Rating
                                            value={rating}
                                            onChange={(event, newValue) => setRating(newValue)}
                                            precision={1}
                                        />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            {rating ? `You rated this book ${rating} stars` : 'Click to rate'}
                                        </Typography>
                                    </div>
                                    
                                    <div className="review-container">
                                        <h3 className="modal-label"><strong>Write a review (optional):</strong></h3>
                                        <textarea
                                            placeholder="Write your review here..."
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            className="review-textarea"
                                        />

                                        <button 
                                            className="submit-button" 
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || !rating}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit"}
                                        </button>

                                        <div className="reviews-list">
                                            <h4>Reviews:</h4>
                                            {isLoadingReviews ? (
                                                <div className="loading-container">
                                                    <Loader2 className="animate-spin" size={24} />
                                                    <p>Loading reviews...</p>
                                                </div>
                                            ) : bookReviews && bookReviews.length > 0 ? (
                                                bookReviews.map((review, index) => (
                                                    <div key={index} className="review-item">
                                                        <div className="review-header">
                                                            <div className="review-user">
                                                                {review.profilePic ? (
                                                                    <img src={review.profilePic} alt={review.userName} className="review-profile-pic" />
                                                                ) : (
                                                                    <div className="review-profile-placeholder">{review.userName.charAt(0)}</div>
                                                                )}
                                                                <span className="review-username">{review.userName}</span>
                                                            </div>
                                                            <div className="review-rating">
                                                                <Rating name="read-only" value={review.stars} readOnly size="small" />
                                                            </div>
                                                        </div>
                                                        <p className="review-text">{review.review}</p>
                                                        <div className="review-date">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-reviews">No reviews yet. Be the first to review this book!</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
