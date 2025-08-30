import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from './context/auth.jsx'
import Landing from './comps/landing/Landing'
import HomePage from './comps/home/HomePage'
import Book from './comps/book/Book';
import ProfilePage from './comps/profile/ProfilePage.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <AuthProvider>
        <div className='hover:cursor-default overflow-x-hidden'>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/book/:isbn" element={<Book />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
