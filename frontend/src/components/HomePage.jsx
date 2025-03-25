import React, { useState } from "react"; 
import "./HomePage.css"; 
import { useNavigate } from "react-router-dom";
import {Search, User, LogOut } from "lucide-react";

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
                                    <button className="details-button">Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                                
                <h1 className="section-title">Recommended For You</h1>

            </main>
        </div>
    );
}
