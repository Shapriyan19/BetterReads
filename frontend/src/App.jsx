import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import ForgotPassword from './components/ForgotPassword';
import HomePage from './components/HomePage';
import BookClubListingPage from './components/BookClubListing';
import BookClubCreator from './components/BookClubCreator';
import BookClubDetails from './components/BookClubDetails';
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import {Loader} from "lucide-react";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function AppContent() {
  const {authUser,checkAuth,isCheckingAuth} = useAuthStore();

  useEffect(()=>{
    checkAuth()
  },[checkAuth]);
  
  console.log({authUser});
  
  if(isCheckingAuth && !authUser) 
    return(
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  )

  return (
    <>
      {/*display the Logo at the top of page in header*/}
      {/*show this header only on login/signup/forgotpassword pages*/}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/home" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/home" />} />
        <Route path="/forgotpassword" element={!authUser ? <ForgotPassword /> : <Navigate to="/home" />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/bcl" element={
          <ProtectedRoute>
            <BookClubListingPage />
          </ProtectedRoute>
        } />
        <Route path="/bookclub/create" element={
          <ProtectedRoute>
            <BookClubCreator />
          </ProtectedRoute>
        } />
        <Route path="/bookclub/:id" element={
          <ProtectedRoute>
            <BookClubDetails />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AppContent />
  );
}
