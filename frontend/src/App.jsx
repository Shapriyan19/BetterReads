import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import Logo from './components/BetterReadsWord';
import ForgotPassword from './components/ForgotPassword';
import HomePage from './components/HomePage';
import './App.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/*display the Logo at the top of page in header*/}
    
      <Router>
          <header className="site-header">
              <div className ="header-inner">
                <Logo />
              </div>
          </header>

          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/home" element={<HomePage />} />
          </Routes>
      </Router>
    </>
  )
}

export default App
