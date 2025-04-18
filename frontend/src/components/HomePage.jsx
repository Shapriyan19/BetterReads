import React, { useState, useEffect } from "react"; 
import "./HomePage.css"; 
import { useNavigate } from "react-router-dom";
import {Search, User, Loader2, Music } from "lucide-react";
import singaporeMap from "../assets/SingaporeMapFrame.webp";
import Rating from '@mui/material/Rating';
import bookCover from "../assets/placeholder.jpg";
import { useAuthStore } from "../store/useAuthStore";
import { useBookStore } from "../store/useBookStore";
import toast from "react-hot-toast";
import { Dialog, DialogTitle, DialogContent, Box, Typography } from '@mui/material';

export default function HomePage () {
    const { logout, authUser } = useAuthStore();
    const { recommendedBooks, getRecommendedBooks, getBookDetails, searchBooks, isLoading, isLoadingDetails, getReviews, postReview, postRating, getAverageRating, bookReviews, isLoadingReviews, averageRating, totalRatings, getAvailability, availability, isLoadingAvailability, getSpotifyTracks, spotifyTracks, isLoadingTracks, getAIReviewSummary, isLoadingAIReviewSummary, aiReviewSummary } = useBookStore();
    
    /* displaying availability */
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [locationData, setLocationData] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    
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
    const [showTracks, setShowTracks] = useState(false);

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
        // Reset location data for new book
        setLocationData([]);
        setSelectedBranch("");
        // Reset tracks state
        setShowTracks(false);
        
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
            
            // Get AI review summary
            const authorName = book.author_name?.[0] || book.authors?.[0]?.name || 'Unknown Author';
            getAIReviewSummary(book.title, authorName);
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
        setLocationData([]);
        setSelectedBranch("");
        // Reset tracks state
        setShowTracks(false);
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

    const handleViewLocations = async () => {
        if (!selectedBook) return;
        
        setIsLoadingLocations(true);
        setLocationData([]);
        let hasShownToast = false;
        
        try {
            // Get the ISBN of the selected book
            const isbn = selectedBook.isbn?.[0] || selectedBook.isbn_13?.[0] || selectedBook.isbn_10?.[0];
            
            if (!isbn) {
                toast.error("ISBN information not available for this book");
                hasShownToast = true;
                return;
            }
            
            // Fetch availability data
            const availabilityData = await getAvailability(isbn);
            
            if (availabilityData && availabilityData.length > 0) {
                setLocationData(availabilityData);
                // Open the map modal
                setMapModalOpen(true);
            } else {
                toast.error("No availability information found for this book");
                hasShownToast = true;
            }
        } catch (error) {
            console.error("Error fetching availability:", error);
            
            // Extract the most useful error message
            let errorMessage = "Could not fetch availability information";
            
            // Check for the specific "brn not found" error
            if (error.response?.data?.error?.message === "brn not found" || 
                error.response?.data?.message?.includes("brn not found")) {
                errorMessage = "Book not found in library system";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if (!hasShownToast) {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const handleGetSuggestedSongs = async () => {
        if (!selectedBook) return;
        
        try {
            // Get the primary subject/category of the book
            const bookCategory = selectedBook.primary_subject || 
                               (selectedBook.subject && selectedBook.subject[0]) || 
                               (selectedBook.subjects && selectedBook.subjects[0]);
            
            // Format the category for better search results
            const formattedCategory = bookCategory
                .split('_')
                .join(' ')
                .split('/')
                .join(' & ')
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            console.log("Sending book category:", formattedCategory, "and book name:", selectedBook.title);
            await getSpotifyTracks(formattedCategory, selectedBook.title);
            setShowTracks(true);
        } catch (error) {
            console.error('Error getting suggested songs:', error);
            toast.error('Failed to get suggested songs');
        }
    };

    const libraryLocations = [
        {
            name: "National Library / Lee Kong Chian Reference Library / Central Arts/Public Library",
            address: "100 Victoria Street, 188064" ,
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "60%",
            left: "50%",
        },
        {
            name: "Ang Mo Kio Public Library",
            address: "4300 Ang Mo Kio Avenue 6, 569842",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "Yes",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "33%",
            left: "50%",
        },
        {
            name: "Bedok Public Library",
            address: "11 Bedok North Street 1 #02-03 & #03-04",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "52%",
            left: "68%",
        },
        {
            name: "Bishan Public Library",
            address: "5 Bishan Place #01-01, 579841",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "Yes",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "42%",
            left: "49%",
        },
        {
            name: "Bukit Batok Public Library",
            address: "1 Bukit Batok Central Link #03-01, 658713",
            hours: "Closed",
            wheel: "Yes",
            cafe: "No",
            desc: "The Bukit Batok Public Library is closed for renovations. Visit NLB’s pilot initiative, 'Browse-n-Borrow' at West Mall, level 2. It offers a curated selection of up to 750 books for loan. It also allows for reservations to be collected. Returns and payments are not supported.",
            top: "44%",
            left: "32%",
        },
        {
            name: "Bukit Panjang Public Library",
            address: "1 Jelebu Road #04-04 & 16/17",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "32%",
            left: "36%",
        },
        {
            name: "Cheng San Public Library",
            address: "90 Hougang Avenue 10 #03-11, 538766",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "37%",
            left: "60%",
        },
        {
            name: "Choa Chu Kang Public Library",
            address: "21 Choa Chu Kang Ave 4 #04-01/02 & #05-06, 689812",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays. Study and Multimedia Zone: 9:00 AM – 10:00 PM(including Public Holidays, eves of Christmas, New Year, and Chinese New Year)",
            top: "30%",
            left: "28%",
        },
        {
            name: "Clementi Public Library",
            address: "3155 Commonwealth Avenue West #05-13/14/15, 129588",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "58%",
            left: "34%",
        },
        {
            name: "Geylang East Public Library",
            address: "50 Geylang East Ave 1, 389777",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "55%",
            left: "59%",
        },
        {
          name: "Jurong Regional Library",
          address: "21 Jurong East Central 1, 609732",
          hours: "Mon - Sun: 10:00 AM - 09:00 PM",
          wheel: "Yes",
          cafe: "Yes",
          desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
          top: "51%",
          left: "28%"
        },
        {
            name: "Jurong West Public Library",
            address: "60 Jurong West Central 3 #01-03, 648346",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "48%",
            left: "20%"
        },
        {
            name: "library@chinatown",
            address: "133 New Bridge Road #04-12, 059413",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "69%",
            left: "48%",
        },
        {
            name: "library@harbourfront",
            address: "1 Harbourfront Walk #03-05 (Lobby F), 098585",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM, Extended Hours: 9:00 AM - 11:00 AM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "78%",
            left: "44%",
        },
        {
            name: "library@orchard",
            address: "277 Orchard Road #03-12 / #04-11, 238858",
            hours: "Closed for renovations",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "61%",
            left: "46.5%",
        },
        {
            name: "Marine Parade Public Library",
            address: "278 Marine Parade Road #01-02, 449282",
            hours: "Closed for renovations",
            wheel: "Yes",
            cafe: "Yes",
            desc: "Book Dispenser @ Marine Parade is accessible all day outside FairPrice Finest at 6 Marine Parade Central.",
            top: "62%",
            left: "62%",
        },
        {
            name: "Pasir Ris Public Library",
            address: "1 Pasir Ris Central St 3 #04-01/06, 518457",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "37%",
            left: "73%",
        },
        {
            name: "Punggol Regional Library",
            address: "1 Punggol Drive #01-12, 828629",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "Yes",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays. Study Zone: 9:00 AM – 10:00 PM daily (including Public Holidays, eves of Christmas, New Year, and Chinese New Year).",
            top: "22%",
            left: "62%",
        },
        {
            name: "Queenstown Public Library",
            address: "53 Margaret Drive, 149297",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "Yes",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "63%",
            left: "41%",
        },
        {
            name: "Sembawang Public Library",
            address: "30 Sembawang Drive #05-01, 757713",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "9%",
            left: "44%",
        },
        {
            name: "Sengkang Public Library",
            address: "1 Sengkang Square #03-28 & #04-19, 545078",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "28%",
            left: "60%",
        },
        {
            name: "Serangoon Public Library",
            address: "23 Serangoon Central #04-82/83, 556083",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "42%",
            left: "55%",
        },
        {
            name: "Botanic Gardens' Library",
            address: "1 Cluny Rd, Level 1, Botany Centre, Tanglin Entrance, Botanic Gardens, 259569",
            hours: "Closed to facilitate digitalisation of Herbarium and Archive collections 16 Sept 2024 to 2027",
            wheel: "",
            cafe: "",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "52%",
            left: "42%",
        },
        {
            name: "Tampines Regional Library",
            address: "1 Tampines Walk #02-01, 528523",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "44%",
            left: "70%",
        },
        {
            name: "Toa Payoh Public Library",
            address: "6 Toa Payoh Central, 319191",
            hours: "Mon - Sun: 10:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "50%",
            left: "52%",
        },
        {
          name: "Woodlands Regional Library",
          address: "900 South Woodlands Drive, 730900",
          hours: "Mon - Sun: 10:00 AM - 09:00 PM",
          wheel: "Yes",
          cafe: "Yes",
          desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
          top: "14%",
          left: "38%"
        },
        {
            name: "Yishun Public Library",
            address: "930 Yishun Ave 2, 769098",
            hours: "Mon - Sun: 11:00 AM - 09:00 PM",
            wheel: "Yes",
            cafe: "No",
            desc: "Closed at 5.00pm on eves of Christmas, New Year and Chinese New Year. Closed on Public Holidays.",
            top: "17%",
            left: "49%"
          },
    
        // finish later
      ];
      
      const [selectedLocation, setSelectedLocation] = useState(null);

const handleMarkerClick = (location) => {
  setSelectedLocation(location);
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
                                            disabled={isLoadingLocations || locationData.length === 0}
                                        >
                                            <option value="">View Availability</option>
                                            {locationData.length > 0 ? (
                                                locationData.map((item, index) => (
                                                    <option key={index} value={item.location?.code || ""}>
                                                        {item.location?.name || "Unknown"} — {item.status?.name === "On Loan" ? "Loaned" : item.status?.name || "Unknown"}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No availability data</option>
                                            )}
                                        </select>
                                        <button 
                                            className="view-map-button" 
                                            onClick={handleViewLocations}
                                            disabled={isLoadingLocations}
                                        >
                                            {isLoadingLocations ? "Loading..." : "View Locations"}
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
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mt: 1, mb: 2 }}>
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
                                    
                                    <div className="spotify-section">
                                        <h3 className="modal-label"><strong>Suggested Songs:</strong></h3>
                                        {!showTracks ? (
                                            <button 
                                                className="get-songs-button" 
                                                onClick={handleGetSuggestedSongs}
                                                disabled={isLoadingTracks}
                                            >
                                                {isLoadingTracks ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={16} />
                                                        <span>Loading songs...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Music size={16} />
                                                        <span>Get Suggested Songs</span>
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="tracks-container">
                                                {spotifyTracks.length > 0 ? (
                                                    <ul className="tracks-list">
                                                        {spotifyTracks.map((track, index) => (
                                                            <li key={index} className="track-item">
                                                                <div className="track-info">
                                                                    {track.albumCover && (
                                                                        <img 
                                                                            src={track.albumCover} 
                                                                            alt={`${track.songName} album cover`} 
                                                                            className="track-cover"
                                                                        />
                                                                    )}
                                                                    <span className="track-name">{track.songName}</span>
                                                                </div>
                                                                <a 
                                                                    href={track.external_urls.spotify} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="spotify-link"
                                                                >
                                                                    Listen on Spotify
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No songs found for this category.</p>
                                                )}
                                                <button 
                                                    className="refresh-songs-button" 
                                                    onClick={handleGetSuggestedSongs}
                                                    disabled={isLoadingTracks}
                                                >
                                                    Refresh Songs
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="review-container">
                                        <h3 className="modal-label"><strong>Rate and Review this book:</strong></h3>
                                        
                                        <div className="rating-section">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <Rating
                                            value={rating}
                                            onChange={(event, newValue) => setRating(newValue)}
                                            precision={1}
                                        />
                                                <Typography variant="body2">
                                            {rating ? `You rated this book ${rating} stars` : 'Click to rate'}
                                        </Typography>
                                            </div>
                                    </div>
                                    
                                        <div className="review-text-section">
                                            <h4 className="modal-label"><strong>Write a review (optional):</strong></h4>
                                        <textarea
                                            placeholder="Write your review here..."
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            className="review-textarea"
                                        />
                                        </div>

                                        <button 
                                            className="submit-button" 
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || !rating}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit"}
                                        </button>

                                        <div className="reviews-list">
                                            <h4>Reviews:</h4>
                                            
                                            <div className="ai-review-summary-section">
                                                <h3>AI Generated Review Summary</h3>
                                                {isLoadingAIReviewSummary ? (
                                                    <div className="loading-ai-summary">
                                                        <Loader2 className="animate-spin" size={16} />
                                                        <span>Generating AI summary...</span>
                                                    </div>
                                                ) : aiReviewSummary ? (
                                                    <div className="ai-summary-content">
                                                        <p>{aiReviewSummary}</p>
                                                    </div>
                                                ) : (
                                                    <p className="no-ai-summary">AI summary not available for this book.</p>
                                                )}
                                            </div>
                                            
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
                        
                        {isLoadingLocations ? (
                            <div className="loading-container">
                                <Loader2 className="animate-spin" size={24} />
                                <p>Loading availability information...</p>
                            </div>
                        ) : ( <>

                                <div className="map-container">
                                        <img src={singaporeMap} alt="Map of Singapore" className="map-image" />
                                        {libraryLocations.map((location, index) => (
                                          <button
                                            key={index}
                                            className="location-marker"
                                            style={{ top: location.top, left: location.left }}
                                            onClick={() => handleMarkerClick(location)}
                                          >
                                            📍
                                          </button>
                                        ))}
                                      </div>

                                {selectedLocation && (
                                    <div className="location-details">
                                      <h3>{selectedLocation.name}</h3>
                                      <p><strong>Address:</strong> {selectedLocation.address}</p>
                                      <p><strong>Opening Hours:</strong> {selectedLocation.hours}</p>
                                      <p><strong>Wheelchair Accessible:</strong> {selectedLocation.wheel}&emsp;&emsp;&emsp;<strong>Cafe:</strong> {selectedLocation.cafe}</p>
                                      <p>{selectedLocation.desc}</p>
                                    </div>
                                  )}

                                
                                {locationData.length > 0 ? (
                                    <div className="location-list">
                                        <h3>Available at:</h3>
                                        <ul>
                                            {locationData.map((item, index) => (
                                                <li key={index}>
                                                    <strong>{item.location?.name || "Unknown Location"}</strong>
                                                    <div className="item-status">
                                                        <span className={`status-indicator ${item.status?.name === "On Loan" ? "status-loaned" : "status-available"}`}></span>
                                                        {item.status?.name || "Unknown"}
                                                    </div>
                                                    {item.status?.setDate && (
                                                        <div className="availability-date">
                                                            Available after: {new Date(item.status.setDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {item.callNumber && (
                                                        <div className="call-number">
                                                            Call No: {item.formattedCallNumber || item.callNumber}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="no-availability">
                                        <p>This book was not found in the library system.</p>
                                        <p>It may be available through other sources or not yet added to the library catalog.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
