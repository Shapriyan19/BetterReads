import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import Logo from './components/BetterReadsWord';
import ForgotPassword from './components/ForgotPassword';
import HomePage from './components/HomePage';
import './App.css';

function AppContent() {
  const location = useLocation();

  return (
    <>
      {/*display the Logo at the top of page in header*/}
      {/*show this header only on login/signup/forgotpassword pages*/}
      {
      ["/", "/signup", "/forgotpassword"].includes(location.pathname) && (
          <header className="site-header">
              <div className ="header-inner">
                <Logo />
              </div>
          </header>
      )
      }

          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/home" element={<HomePage />} />
          </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
