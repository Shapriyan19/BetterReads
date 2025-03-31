import React, { useState, useRef } from "react";
import "./SignUpPage.css"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: "",
        preferences: [],
        profilePic: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");
    const { signup, isSigningUp } = useAuthStore();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("Profile picture must be less than 5MB");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                setFormData(prev => ({
                    ...prev,
                    profilePic: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePreferenceChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            preferences: checked 
                ? [...prev.preferences, value]
                : prev.preferences.filter(pref => pref !== value)
        }));
    };

    const validateForm = () => {
        const { firstName, lastName, email, password, confirmPassword, location, preferences } = formData;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !location) {
            setError("All fields are required.");
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return false;
        }

        // Password validation (8+ characters)
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return false;
        }

        // Confirm password
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        // Preferences validation
        if (preferences.length === 0) {
            setError("Please select at least one preference.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        try {
            const { confirmPassword, ...signupData } = formData;
            const formDataToSend = new FormData();
            
            // Append all text fields
            Object.keys(signupData).forEach(key => {
                if (key === 'preferences') {
                    formDataToSend.append(key, JSON.stringify(signupData[key]));
                } else if (key !== 'profilePic') {
                    formDataToSend.append(key, signupData[key]);
                }
            });
            
            // Append profile picture if exists
            if (signupData.profilePic) {
                formDataToSend.append('profilePic', signupData.profilePic);
            }

            await signup(formDataToSend);
            navigate("/home");
        } catch (error) {
            setError(error.message || "Signup failed. Please try again.");
        }
    };

    return (
        <div className="login-container"> 
            <div className="login-box"> 
                <h2>Sign Up</h2>
                {error && <p className="error-message">{error}</p>} 
                
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>First Name</label>
                            <input 
                                type="text"
                                name="firstName"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="input-group">
                            <label>Last Name</label>
                            <input 
                                type="text"
                                name="lastName"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="input-group">
                            <label>Email</label>
                            <input 
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="input-group">
                            <label>Location</label>
                            <input 
                                type="text"
                                name="location"
                                placeholder="Your location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input 
                                type="password"
                                name="password"
                                placeholder="Min 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input 
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="input-group">
                            <label>Profile Picture</label>
                            <div className="profile-upload">
                                <img 
                                    src={previewUrl || '/default-avatar.png'} 
                                    alt="Profile preview" 
                                    className="profile-preview"
                                />
                                <label className="profile-upload-btn">
                                    {formData.profilePic ? 'Change Picture' : 'Upload Picture'}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleProfilePicChange}
                                        disabled={isSigningUp}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Reading Preferences (Select at least one)</label>
                            <div className="preferences-grid">
                                {["Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", "Fantasy", "Biography", "History"].map((pref) => (
                                    <label key={pref} className="preference-checkbox">
                                        <input
                                            type="checkbox"
                                            value={pref}
                                            checked={formData.preferences.includes(pref)}
                                            onChange={handlePreferenceChange}
                                            disabled={isSigningUp}
                                        />
                                        {pref}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={isSigningUp}>
                            {isSigningUp ? "Signing up..." : "Sign Up"}
                        </button>
                        <Link to="/login" className="login-link">Already have an account? Log In</Link>
                    </div>
                </form>
            </div>
        </div>
    );     
};

export default SignUpPage;
