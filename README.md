# BetterReads 📚

BetterReads is a modern web application that helps users discover, track, and share their reading experiences. It provides a personalized book recommendation system, allows users to write and read reviews, and includes features for managing book clubs.

## Features 🌟

### User Features
- **User Authentication**
  - Sign up and login functionality
  - Profile management with customizable profile pictures
  - Password recovery system

- **Book Discovery**
  - Personalized book recommendations based on reading preferences
  - Search functionality for books
  - Detailed book information including descriptions and availability

- **Reviews & Ratings**
  - Write and read book reviews
  - Star rating system
  - Profile pictures displayed with reviews

- **Book Clubs**
  - Create and join book clubs
  - View book club listings
  - Detailed book club information

### Technical Features
- Responsive design for all devices
- Modern UI with smooth animations
- Real-time updates
- Secure file uploads for profile pictures
- Integration with external APIs

## Tech Stack 💻

### Frontend
- React.js
- CSS3
- Axios for API calls
- React Router for navigation
- Zustand for state management

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Cloudinary for image storage
- Express-fileupload for handling file uploads

## Getting Started 🚀

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Cloudinary account (for image storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/BetterReads.git
cd BetterReads
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with the following variables:
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_CLIENT_ID=your_spotify_client_id
```

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

## Project Structure 📁

```
BetterReads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   ├── assets/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   └── package.json
└── README.md
```

