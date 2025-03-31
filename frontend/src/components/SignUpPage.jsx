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
            
            // Append all fields directly
            formDataToSend.append('firstName', signupData.firstName);
            formDataToSend.append('lastName', signupData.lastName);
            formDataToSend.append('email', signupData.email);
            formDataToSend.append('password', signupData.password);
            formDataToSend.append('location', signupData.location);
            
            // Append each preference as a separate item in the array instead of stringifying
            signupData.preferences.forEach(pref => {
                formDataToSend.append('preferences[]', pref);
            });
            
            // Append profile picture if exists
            if (signupData.profilePic) {
                formDataToSend.append('profilePic', signupData.profilePic);
            }

            console.log('Form Data being sent:', {
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                email: signupData.email,
                location: signupData.location,
                preferences: signupData.preferences
            });

            const response = await signup(formDataToSend);
            console.log('Signup successful:', response);
            navigate("/home");
        } catch (error) {
            console.error('Signup Error:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
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
                                {["Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", "Fantasy", "Biography", "History"].map((pref) => (
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
