import React, { useState } from "react"; 
import "./LoginPage.css"; 
import { Link, useNavigate } from "react-router-dom";
import Logo from './BetterReadsWord';
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

const LoginPage = () => { 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => { 
        e.preventDefault(); 

        if (!email || !password) {
            toast.error("Both fields are required.");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await login({ email, password });
            navigate("/home");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="login-layout">
            <div className="login-box"> 
                <div className="login-content">
                    <h2>Login</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="labeltext">Email</label>
                            <input 
                                type="email"
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Logging in..." : "Login"}
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
