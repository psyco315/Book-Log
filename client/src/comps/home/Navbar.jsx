import React, { useState } from 'react'
import homeImg from '../../assets/home.png'
import listImg from '../../assets/list.png'
import profileImg from '../../assets/profile.png'
import searchImg from '../../assets/search.png'
import './navbar.css'

import { SparklesText } from "@/components/magicui/sparkles-text";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { motion } from "motion/react"
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/auth'

const Navbar = () => {
    const { authModal, setAuthModal } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
            // Implement your search logic here
        }
    };

    return (
        <motion.div
            className='navBar'
            initial={{
                y: -100,
                opacity: 0
            }}
            animate={{
                y: 0,
                opacity: 1
            }}
            transition={{
                duration: 0.6,
                ease: "easeOut"
            }}
        >
            <div className='navbar-container'>
                <div className='navbar-logo'>
                    <img src={profileImg} alt="" className='navbar-logo-img' />
                    <SparklesText sparklesCount='8' className='navbar-title'>
                        BookStop
                    </SparklesText>
                </div>

                {/* Search Bar */}
                <div className='navbar-search'>
                    <div className='search-input-container'>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search a book/author..."
                            className='search-input'
                        />
                        <img src={searchImg} alt="Search" className='search-icon' />
                    </div>
                    <motion.button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim()}
                        className={`search-btn ${searchQuery.trim() ? 'search-btn-active' : 'search-btn-disabled'}`}
                        whileHover={searchQuery.trim() ? { scale: 1.05 } : {}}
                        whileTap={searchQuery.trim() ? { scale: 0.95 } : {}}
                    >
                        Search
                    </motion.button>
                </div>

                <div className='navbar-nav'>
                    <Link to='/home'>
                        <button className='navBarBtn'>
                            <img src={homeImg} alt="" />
                            <div>Home</div>
                        </button>
                    </Link>
                    <button className='navBarBtn'>
                        <img src={listImg} alt="" />
                        <div>Library</div>
                    </button>
                    <button className='navBarBtn'>
                        <img src={profileImg} alt="" />
                        <div>Profile</div>
                    </button>
                    <button className='signin-btn' onClick={() => setAuthModal(true)}>
                        <AnimatedGradientText>
                            SignIn
                        </AnimatedGradientText>
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export default Navbar