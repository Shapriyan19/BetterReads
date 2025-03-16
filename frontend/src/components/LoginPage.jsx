import React, { useState } from "react"; //importing React and useState which is a 
                                         //React Hook that lets us store data inside a component
import "./LoginPage.css"; 

const LoginPage = () => { //creating component called LoginPage
    const [username, setUsername] = useState(""); //username:store user's username, setUsername: updates username when user types
    const [password, setPassword] = useState(""); //password: store user's password input, setPassword: updates password when user types
    const [error, setError] = useState(""); //error: stores error messages if fields are empty, setError: updates error when validation fails


    const handleSubmit = (e) => { //function runs when login button is clicked
        e.preventDefault(); //stops pages from refreshing when form is submitted

        if (!username || !password) {
            setError("Both fields are required.");
            return;
        }

        setError(""); //clears error messages if fields are filled

        console.log("Logging in with:", { username, password }); //prints email & pw to console for debugging
        alert("Login successful! (Simulated)"); // displays an alert, TO BE REPLACED w real authentication
    }

    return (
        <div className="login-container"> 
            <div className="login-box"> 
                <h2>Login</h2>

                {/*show error message if there is an error*/}
                {error && <p className="error-message">{error}</p>} 
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input 
                            type="text"
                            placeholder="Enter your username" //textbox for username
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} //updates username when user types
                            required //ensures input is mandatory
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password"
                            placeholder="Enter your password" //textbox for password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} //updates password when user types
                            required //ensures input is mandatory
                        />
                    </div>

                    <button type= "submit">Login</button>
                </form>
            </div>
        </div>
    );     
};

export default LoginPage;
