import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import defaultprofileimage from '../assets/BRLogoCircle.png';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfilePage() {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [readingInterests, setReadingInterests] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      setName(authUser.firstName + ' ' + authUser.lastName);
      setEmail(authUser.email);
      setReadingInterests(authUser.preferences.join(', '));
      if (authUser.profilePic) {
        setPreviewUrl(authUser.profilePic);
      }
    }
  }, [authUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Profile picture must be less than 5MB");
        return;
      }
      
      setProfileImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadPhoto = async () => {
    if (!profileImage) {
      alert("Please select a file first");
      return;
    }

    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('profilePic', profileImage);
      
      // Send the FormData to the backend
      await updateProfile(formData);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    }
  };

  const handleSave = () => {
    // Implement your save logic here
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Current Password:', currentPassword);
    console.log('New Password:', newPassword);
    console.log('Confirm Password:', confirmPassword);
    console.log('Reading Interests:', readingInterests);
    alert('Profile saved!');
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-photo-section">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
          
          <div className="profile-photo">
            <img 
              src={previewUrl || defaultprofileimage} 
              alt="Profile" 
              className="profile-placeholder" 
            />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button 
            className="upload-button" 
            onClick={handleUploadClick}
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? 'Uploading...' : 'Upload new photo'}
          </button>
          {profileImage && (
            <button 
              className="save-button" 
              onClick={handleUploadPhoto}
              disabled={isUpdatingProfile}
              style={{ marginTop: '10px' }}
            >
              Save Photo
            </button>
          )}
        </div>

        <div className="profile-details">
          <h2 className="profile-title">Profile Details</h2>
          <p className="details-subtitle">Update your personal information and preferences</p>

          <div className="form-group-name">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              placeholder="Name" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="input-profile-name"
            />
          </div>

          <div className="form-group-email">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-profile-email"
            />
          </div>

          <div className="form-group-pw">
            <label>Change Password</label>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-profile-pw"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-profile-pw"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-profile-pw"
            />
          </div>

          <div className="form-group-interests">
            <label htmlFor="interests">Reading Interests</label>
            <input
              type="text"
              id="interests"
              placeholder="Select the genres you enjoy reading"
              value={readingInterests}
              onChange={(e) => setReadingInterests(e.target.value)}
              className="input-profile-interests"
            />
          </div>

          <button onClick={handleSave} className="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
}