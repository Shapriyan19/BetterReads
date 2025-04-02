import React, { useState } from "react"; 
import "./LoginPage.css"; 
import { Link, useNavigate } from "react-router-dom";
import Logo from './BetterReadsWord';
import { useAuthStore } from "../store/useAuthStore";

const LoginPage = () => { 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [error, setError] = useState(""); 
    const { login, isLoggingIn } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => { 
        e.preventDefault(); 

        if (!email || !password) {
            setError("Both fields are required.");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError(""); 

        try {
            await login({ email, password });
            navigate("/home");
        } catch (error) {
            setError(error.message || "Login failed. Please try again.");
        }
    }

    return (
        <div className="login-layout">
            <div className="login-box"> 
                <div className="login-content">
                    <h2>Login</h2>

                    {/* Show error message if there is an error */}
                    {error && <p className="error-message">{error}</p>} 
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="labeltext">Email</label>
                            <input 
                                type="email"
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                disabled={isLoggingIn}
                            />
                        </div>

                        <div className="input-group">
                            <label className="labeltext">Password</label>
                            <input 
                                type="password"
                                placeholder="Enter your password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                disabled={isLoggingIn}
                            />
                        </div>

                        <button type="submit" disabled={isLoggingIn}>
                            {isLoggingIn ? "Logging in..." : "Login"}
                        </button>

                        {/* Sign Up & Forgot Password Links */}
                        <div>
                            <Link to="/signup" className="signup">Sign Up?</Link>
                            <Link to="/forgotpassword" className="forgotpass">Forgot Password?</Link>
                        </div>
                    </form>
                </div>
                <div className="logo-box">
                    <Logo />
                </div>
            </div>
        </div>
    );     
};

export default LoginPage;
