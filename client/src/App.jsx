import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Landing from './comps/landing/Landing'
import HomePage from './comps/home/HomePage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className=' overflow-x-hidden'>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<HomePage />} />
          {/* <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} /> */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
