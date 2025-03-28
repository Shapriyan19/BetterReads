import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const [name, setName] = useState('Jane Smith');
  const [email, setEmail] = useState('jane.smith@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [readingInterests, setReadingInterests] = useState('');

  const navigate = useNavigate();

  const handleSave = () => {
    // Implement your save logic here
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Current Password:', currentPassword);
    console.log('New Password:', newPassword);
    console.log('Confirm Password:', confirmPassword);
    console.log('Reading Interests:', readingInterests);
    alert('Profile saved!'); // Simple alert for demonstration
  };

  return (
    <div className="profile-container">
      {/* 
      <h1 className="profile-title">Profile</h1>
      <p className="profile-subtitle">Manage your account settings and reading preferences</p>
      */}

      <button className="back-button" onClick={() => navigate(-1)}>
        ← Go Back
      </button>

      <div className="profile-content">
        <div className="profile-photo-section">
          <div className="profile-photo">
            {/* Placeholder for profile photo */}
          </div>
          <p className="photo-description">This is your public profile photo</p>
          <button className="upload-button">Upload new photo</button>
        </div>

        <div className="profile-details">
          <h2 className="details-title">Profile Details</h2>
          <p className="details-subtitle">Update your personal information and preferences</p>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="input-description">This is your public display name.</p>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="input-description">Your email address is used for notifications and sign-in.</p>
          </div>

          <div className="form-group">
            <label>Change Password</label>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="interests">Reading Interests</label>
            <input
              type="text"
              id="interests"
              placeholder="Select the genres you enjoy reading"
              value={readingInterests}
              onChange={(e) => setReadingInterests(e.target.value)}
            />
          </div>

          <button onClick={handleSave} className="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
