import React, { useState } from "react";
import "./ForgotPassword.css";
import { Link } from "react-router-dom"; // Import the Link component

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // **Backend Integration Point:**
    // Backend Developers: 
    // 1. Modify the following fetch request to send the 'email' data to your backend API.
    // 2. Replace '/api/forgot-password' with the actual endpoint of your forgot password API.
    // 3. Ensure your backend API handles POST requests with a JSON body containing the 'email' field.
    // 4. Your backend API should validate the email, generate a reset token, store it, and send a reset email.
    // 5. The backend API should return a JSON response with a 'message' field on success, and an 'error' field on failure.
    // 6. Handle the backend response in the try/catch block below to update the 'message' state.

    try {
      const response = await fetch("/api/forgot-password", { // **Backend: Modify this endpoint**
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // **Backend: This is the email data sent to the backend**
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); // **Backend: Display success message from backend**
      } else {
        setMessage(data.error || "An error occurred."); // **Backend: Display error message from backend**
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p className="message">{message}</p>}
      <Link to="/" className="back-button">Back to Login</Link>
    </div>
  );
};

export default ForgotPassword;