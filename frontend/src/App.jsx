import { useState } from 'react'
import LoginPage from './components/LoginPage'
import Logo from './components/Logo'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/*display the Logo at the top of page*/}
      <Logo />

      {/*adding login page*/}
      <LoginPage />
    </>
  )
}

export default App
