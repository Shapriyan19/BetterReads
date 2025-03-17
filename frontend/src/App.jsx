import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage'
import Logo from './components/BetterReadsWord'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/*display the Logo at the top of page*/}
      <Logo />
    
      <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
            </Routes>
      </Router>
    </>
  )
}

export default App
