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

    // In SignUpPage.jsx, update the validateForm function
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

        // Password validation - match backend requirements
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return false;
        }
        
        if (!(hasUppercase && hasLowercase && hasNumber && hasSymbol)) {
            setError("Password must include at least 1 uppercase letter, 1 lowercase letter, a number, and a symbol.");
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

    // In handleSubmit function in SignUpPage.jsx
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        try {
            const { confirmPassword, ...signupData } = formData;
            const formDataToSend = new FormData();
            
            // Log the data we're about to send
            console.log("Form data before sending:", {
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                email: signupData.email,
                password: signupData.password ? "exists" : "missing",
                location: signupData.location,
                preferences: signupData.preferences,
                profilePic: signupData.profilePic ? "exists" : "missing"
            });
            
            // Append all text fields
            formDataToSend.append('firstName', signupData.firstName.trim());
            formDataToSend.append('lastName', signupData.lastName.trim());
            formDataToSend.append('email', signupData.email.trim());
            formDataToSend.append('password', signupData.password);
            formDataToSend.append('location', signupData.location.trim());
            
            // Make sure preferences is an array and not empty
            if (!Array.isArray(signupData.preferences) || signupData.preferences.length === 0) {
                setError("Please select at least one reading preference");
                return;
            }
            
            // Convert preferences array to string and append
            formDataToSend.append('preferences', JSON.stringify(signupData.preferences));
            
            // Append profile picture if exists
            if (signupData.profilePic) {
                formDataToSend.append('profilePic', signupData.profilePic);
            }

            // Log the FormData entries
            console.log("FormData entries:");
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await signup(formDataToSend);
            console.log('Signup successful:', response);
            navigate("/home");
        } catch (error) {
            console.error('Signup Error:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
                if (error.response.data.missingFields) {
                    console.error('Missing fields:', error.response.data.missingFields);
                }
            } else {
                setError("Signup failed. Please try again.");
            }
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2 className="signup-title">Sign Up</h2>
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label className="form-label">Profile Picture</label>
                            <div className="profile-section">
                                <img 
                                    src={previewUrl || '/default-avatar.png'} 
                                    alt="Profile preview" 
                                    className="profile-preview"
                                />
                                <label className="upload-btn">
                                    {formData.profilePic ? 'Change Picture' : 'Upload Picture'}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleProfilePicChange}
                                        disabled={isSigningUp}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input 
                                className="form-input"
                                type="text"
                                name="firstName"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input 
                                className="form-input"
                                type="text"
                                name="lastName"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input 
                                className="form-input"
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input 
                                className="form-input"
                                type="text"
                                name="location"
                                placeholder="Your location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input 
                                className="form-input"
                                type="password"
                                name="password"
                                placeholder="Min 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input 
                                className="form-input"
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={isSigningUp}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label className="form-label">Reading Preferences (Select at least one)</label>
                            <div className="preferences-section">
                                {["Fantasy", "Horror", "Thriller", "Romance", "Science Fiction", "Historical Fiction", "Computer Science", "Baby Books"].map((pref) => (
                                    <label key={pref} className="preference-item">
                                        <input
                                            type="checkbox"
                                            className="preference-checkbox"
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
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSigningUp}>
                        {isSigningUp ? "Signing up..." : "Sign Up"}
                    </button>
                    <Link to="/login" className="login-link">Already have an account? Log In</Link>
                </form>
            </div>
        </div>
    );     
};

export default SignUpPage;
