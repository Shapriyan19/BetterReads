import React, { useState, useEffect } from "react"; 
import "./HomePage.css"; 
import { useNavigate } from "react-router-dom";
import {Search, User } from "lucide-react";

import Rating from '@mui/material/Rating';

import bookCover from "../assets/placeholder.jpg";

export default function HomePage () {
    const books = [
        { id: 1, title: "The Midnight Library", author: "Matt Haig", category: "Fiction", coverImage: bookCover },
        { id: 2, title: "Atomic Habits", author: "James Clear", category: "SelfHelp", coverImage: bookCover },
        { id: 3, title: "Educated", author: "Tara Westover", category: "Memoir", coverImage: bookCover },
        { id: 4, title: "The Silent Patient", author: "Alex Michaelides", category: "Thriller", coverImage: bookCover },
        { id: 5, title: "Becoming", author: "Michelle Obama", category: "Biography", coverImage: bookCover },
        { id: 6, title: "Dune", author: "Frank Herbert", category: "SciFi", coverImage: bookCover },
        { id: 7, title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", coverImage: bookCover },
        { id: 8, title: "Sapiens", author: "Yuval Noah Harari", category: "History", coverImage: bookCover },
        { id: 9, title: "1984", author: "George Orwell", category: "Dystopian", coverImage: bookCover },
        { id: 10, title: "The Alchemist", author: "Paulo Coelho", category: "Philosophical", coverImage: bookCover },
        { id: 11, title: "Pride and Prejudice", author: "Jane Austen", category: "Romance", coverImage: bookCover },
        { id: 12, title: "To Kill a Mockingbird", author: "Harper Lee", category: "Classic", coverImage: bookCover },
        { id: 13, title: "The Book Thief", author: "Markus Zusak", category: "Historical Fiction", coverImage: bookCover },
        { id: 14, title: "The Power of Now", author: "Eckhart Tolle", category: "Spirituality", coverImage: bookCover },
        { id: 15, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", coverImage: bookCover },
        { id: 16, title: "It Ends With Us", author: "Colleen Hoover", category: "Contemporary", coverImage: bookCover },
        { id: 17, title: "The 5 AM Club", author: "Robin Sharma", category: "SelfHelp", coverImage: bookCover },
        { id: 18, title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", category: "Drama", coverImage: bookCover },
        { id: 19, title: "Outliers", author: "Malcolm Gladwell", category: "NonFiction", coverImage: bookCover },
        { id: 20, title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", category: "SelfHelp", coverImage: bookCover },
        { id: 21, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", category: "Fantasy", coverImage: bookCover },
        { id: 22, title: "Little Fires Everywhere", author: "Celeste Ng", category: "Fiction", coverImage: bookCover },
        { id: 23, title: "Normal People", author: "Sally Rooney", category: "Contemporary", coverImage: bookCover },
        { id: 24, title: "Girl, Wash Your Face", author: "Rachel Hollis", category: "Motivational", coverImage: bookCover },
        { id: 25, title: "A Court of Thorns and Roses", author: "Sarah J. Maas", category: "Fantasy", coverImage: bookCover },
        { id: 26, title: "Where the Crawdads Sing", author: "Delia Owens", category: "Mystery", coverImage: bookCover },
        { id: 27, title: "Can't Hurt Me", author: "David Goggins", category: "Biography", coverImage: bookCover },
        { id: 28, title: "Hunger Games", author: "Suzanne Collins", category: "Dystopian", coverImage: bookCover },
        { id: 29, title: "The Four Agreements", author: "Don Miguel Ruiz", category: "Philosophy", coverImage: bookCover },
        { id: 30, title: "How to Win Friends and Influence People", author: "Dale Carnegie", category: "SelfHelp", coverImage: bookCover },
    ];

    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    const handleBCL = () => {
        navigate('/bcl');
    };

    const [selectedBook, setSelectedBook] = useState(null);

    const openModal = (book) => {
        setSelectedBook(book);
    };

    const closeModal = () => {
        setSelectedBook(null);
    };

    const [rating, setRating] = useState(null);

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

                <div className= "search-container">
                    <Search className="search-icon"/>
                    <input type= "search" placeholder="Search for a book..." className="search-input"/>
                </div>

                <div className="user-actions">
                    <button className="profile-icon" onClick ={handleProfile}>
                        <User size={20} />
                    </button>
                    <button className= "bookclub-button" onClick ={handleBCL}>
                        My Book Club
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </header>

            <main className="main-section">
                <h1 className="section-title">Featured Books</h1>
                    <div className="grid-container">
                        {books.map((book) =>(
                            <div key={book.id} className="card">
                                <img src={book.coverImage} alt={book.title} className="card-img" />
                                <div className="card-body">
                                    <h3 className="book-title">{book.title}</h3>
                                    <p className="book-author">{book.author}</p>
                                </div>
                                <div className="card-footer">
                                    <span className="category-badge">{book.category}</span>
                                    <button className="details-button" onClick = {() => openModal(book)}>
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                                
                <h1 className="section-title">Recommended For You</h1>

            </main>

            {selectedBook && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <span className = "close-icon" onClick = {closeModal}>&times;</span>
                        <img src={selectedBook.coverImage} alt={selectedBook.title} className="details-img" />
                            <div className = "modal-content">
                                <h2>{selectedBook.title}</h2>
                                <p><strong>Author:</strong> {selectedBook.author}</p>
                                <p><strong>Category:</strong> {selectedBook.category}</p>
                                {rating && (
                                    <div className = "total-book-rating">
                                            <Rating name="read-only" value={rating} readOnly />
                                            <span className = "rating-text"> {rating} out of 5 </span>
                                    </div>
                                )}
                                <p><strong>Description:</strong></p>
                                <p>Tara Westover was 17 the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she prepared for the end of the world by stockpiling home-canned peaches and sleeping with her "head-for-the-hills bag". In the summer she stewed herbs for her mother, a midwife and healer, and in the winter she salvaged in her father's junkyard.</p>
                                <p>Her father forbade hospitals, so Tara never saw a doctor or nurse. Gashes and concussions, even burns from explosions, were all treated at home with herbalism. The family was so isolated from mainstream society that there was no one to ensure the children received an education and no one to intervene when one of Tara's older brothers became violent.</p>
                                <p>Then, lacking any formal education, Tara began to educate herself. She taught herself enough mathematics and grammar to be admitted to Brigham Young University, where she studied history, learning for the first time about important world events like the Holocaust and the civil rights movement. Her quest for knowledge transformed her, taking her over oceans and across continents, to Harvard and to Cambridge. Only then would she wonder if she'd traveled too far, if there was still a way home.</p>
                                <p>Educated is an account of the struggle for self-invention. It is a tale of fierce family loyalty and of the grief that comes with severing the closest of ties. With the acute insight that distinguishes all great writers, Westover has crafted a universal coming-of-age story that gets to the heart of what an education is and what it offers: the perspective to see one's life through new eyes and the will to change it.</p>
                                <div className="rating-container">
                                    <h3 className="modal-label"><strong> Give a Rating: </strong></h3>
                                    <Rating
                                        name="simple-controlled"
                                        value={rating}
                                        onChange={(event, newValue) => { setRating(newValue); 
                                        }}
                                    />
                                </div>
                                <div className="review-container">
                                    <h3 className="modal-label"><strong> Make a Review: </strong></h3>
                                </div>
                            </div>
                    </div>
                </div>
            )}

        </div>
    );
}
