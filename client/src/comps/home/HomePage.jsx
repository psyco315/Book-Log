import React, { useState } from 'react'
import Navbar from './Navbar'
import MainBody from './MainBody'
import About from './About'
import './HomePage.css'

import { motion } from 'motion/react'

const HomePage = () => {
  

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
        
      </motion.div>
    </div>
  )
}

export default HomePage