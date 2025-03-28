import React, { useState } from "react"; 
import "./LoginPage.css"; 
import { Link, useNavigate } from "react-router-dom";
import Logo from './BetterReadsWord';

const LoginPage = () => { 
    const [username, setUsername] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [error, setError] = useState(""); 

    const navigate = useNavigate();

    const handleSubmit = (e) => { 
        e.preventDefault(); 

        if (!username || !password) {
            setError("Both fields are required.");
            return;
        }

        setError(""); 

        console.log("Logging in with:", { username, password }); 
        navigate("/home");
    }

    return (
        <div className="login-layout">

            <div className="login-box"> 

                <h2>Login</h2>

                {/* Show error message if there is an error */}
                {error && <p className="error-message">{error}</p>} 
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className = "labeltext">Username</label>
                        <input 
                            type="text"
                            placeholder="Enter your username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label className = "labeltext">Password</label>
                        <input 
                            type="password"
                            placeholder="Enter your password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit">Login</button>

                    {/* Sign Up & Forgot Password Links */}
                    <div>
                        <Link to="/signup" className="signup">Sign Up?</Link>
                        <Link to="/forgotpassword" className="forgotpass">Forgot Password?</Link>
                    </div>
                </form>
            </div>

            <div className = "logo-box">
                <Logo />
            </div>

        </div>
    );     
};

export default LoginPage;
