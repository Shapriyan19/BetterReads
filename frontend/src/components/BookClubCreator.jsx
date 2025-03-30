import React, { useState } from 'react';
import './BookClubCreator.css';
import Logo from './BetterReadsSquare';
import { useNavigate } from 'react-router-dom';

const BookClubCreator = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    categories: [],
    language: '',
    maxMembers: '',
    privacy: 'public',
    books: ['', '', '']
  });

  const categoryOptions = [
    "Fiction", "SelfHelp", "Memoir", "Thriller", "Biography", "SciFi", "Fantasy", "History",
    "Dystopian", "Philosophical", "Romance", "Classic", "Historical Fiction", "Spirituality",
    "Psychology", "Contemporary", "Drama", "Non Fiction", "Motivational", "Mystery", "Philosophy"
  ];
  const languageOptions = ['English', 'Mandarin', 'Malay', 'Tamil'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const toggleCategory = (cat) => {
    setForm((prev) => {
      const newCategories = prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: newCategories };
    });
  };

  const handleBookChange = (index, value) => {
    const updatedBooks = [...form.books];
    updatedBooks[index] = value;
    setForm({ ...form, books: updatedBooks });
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Club Created:', form);
    navigate("/bcl")
  };

  return (
    <div className="club-creator-page">
      <form className="creator-card" onSubmit={handleSubmit}>
      <div className="form-header-image">
            <Logo />
      </div>

        

        <div className="input-group">
        <input
          type="text"
          name="name"
          placeholder="Enter Club Name..."
          value={form.name}
          onChange={handleChange}
          required
        />
          <textarea
            name="description"
            placeholder="Describe your club..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="category-select">
          <p>Select:</p>
          <div className="category-options">
            {categoryOptions.map((cat) => (
              <span
                key={cat}
                className={form.categories.includes(cat) ? 'cat-tag selected' : 'cat-tag'}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="inline-group">
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                className="creator-dropdown"
                required
              >
                <option value="">Language</option>
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
                
              <input
                className="maxMembers"
                type="number"
                name="maxMembers"
                placeholder="Max Members"
                value={form.maxMembers}
                onChange={handleChange}
                required
              />

              <div className="privacy-toggle">
                <div
                  className={form.privacy === 'public' ? 'toggle-option selected' : 'toggle-option'}
                  onClick={() => setForm({ ...form, privacy: 'public' })}
                >
                  Public
                </div>
                <div
                  className={form.privacy === 'private' ? 'toggle-option selected' : 'toggle-option'}
                  onClick={() => setForm({ ...form, privacy: 'private' })}
                >
                  Private
                </div>
              </div>
            </div>


        <div className="book-ids">
          
          {form.books.map((book, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Suggested Book ISBN ${idx + 1}`}
              value={book}
              onChange={(e) => handleBookChange(idx, e.target.value)}
              required
            />
          ))}
        </div>

        <button type="submit">Create Club</button>
      </form>
    </div>
  );
};

export default BookClubCreator;
