import React, { useState } from "react"; 
import "./HomePage.css"; 
import { useNavigate } from "react-router-dom";
import {Search, User } from "lucide-react";

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
      ];

    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const [selectedBook, setSelectedBook] = useState(null);

    const openModal = (book) => {
        setSelectedBook(book);
    };

    const closeModal = () => {
        setSelectedBook(null);
    };
    
    return (
        <div className="home-container">

            <header className="home-header">
                <div className="home-title">Bookshelf</div>

                <div className= "search-container">
                    <Search className="search-icon"/>
                    <input type= "search" placeholder="Search for a book..." className="search-input"/>
                </div>

                <div className="user-actions">
                    <button className="profile-icon">
                        <User size={20} />
                    </button>
                    <button className= "bookclub-button">
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
                                <p><strong>Description:</strong></p>
                                <p>Tara Westover was 17 the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she prepared for the end of the world by stockpiling home-canned peaches and sleeping with her "head-for-the-hills bag". In the summer she stewed herbs for her mother, a midwife and healer, and in the winter she salvaged in her father's junkyard.</p>
                                <p>Her father forbade hospitals, so Tara never saw a doctor or nurse. Gashes and concussions, even burns from explosions, were all treated at home with herbalism. The family was so isolated from mainstream society that there was no one to ensure the children received an education and no one to intervene when one of Tara's older brothers became violent.</p>
                                <p>Then, lacking any formal education, Tara began to educate herself. She taught herself enough mathematics and grammar to be admitted to Brigham Young University, where she studied history, learning for the first time about important world events like the Holocaust and the civil rights movement. Her quest for knowledge transformed her, taking her over oceans and across continents, to Harvard and to Cambridge. Only then would she wonder if she'd traveled too far, if there was still a way home.</p>
                                <p>Educated is an account of the struggle for self-invention. It is a tale of fierce family loyalty and of the grief that comes with severing the closest of ties. With the acute insight that distinguishes all great writers, Westover has crafted a universal coming-of-age story that gets to the heart of what an education is and what it offers: the perspective to see one's life through new eyes and the will to change it.</p>
                            </div>
                    </div>
                </div>
            )}

        </div>
    );
}
