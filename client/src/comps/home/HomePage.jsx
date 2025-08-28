import React from 'react'
import Navbar from './Navbar'
import MainBody from './MainBody'
import About from './About'
import SignIn from '../auth.js/SignIn'
import './HomePage.css'

import { useAuth } from '../../context/auth'

import { motion } from 'motion/react'

const HomePage = () => {
  const { authModal, setAuthModal } = useAuth();

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
          isOpen={authModal}           // Controls modal visibility
          onClose={() => setAuthModal(false)}          // Called when modal should close
          onSwitchToSignUp={() => { }}   // Called when user wants to sign up
        />
      </motion.div>
    </div>
  )
}

export default HomePage