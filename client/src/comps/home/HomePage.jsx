import React, { useState } from 'react'
import Navbar from './Navbar'
import MainBody from './MainBody'
import About from './About'
import SignIn from '../auth.js/SignIn'
import SignUp from '../auth.js/SignUp'
import './HomePage.css'

import { useAuth } from '../../context/auth'

import { motion } from 'motion/react'

const HomePage = () => {
  const { authModal, setAuthModal } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);

  const handleClose = () => {
    setAuthModal(false);
    // Reset to SignIn when modal is closed
    setIsSignIn(true);
  };

  return (
    <div className='homePage relative hover:cursor-default min-h-screen text-white/80 flex flex-col items-center'>
      <Navbar />
      <motion.div className='totalContentBox'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeOut"
        }}
      >
        <MainBody />
        <About />
        <SignIn
          isOpen={authModal && isSignIn}
          onClose={handleClose}
          onSwitchToSignUp={() => setIsSignIn(false)}
        />
        <SignUp
          isOpen={authModal && !isSignIn}
          onClose={handleClose}
          onSwitchToSignIn={() => setIsSignIn(true)}
        />
      </motion.div>
    </div>
  )
}

export default HomePage