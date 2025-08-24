import React, { useState } from 'react'
import homeImg from '../../assets/home.png'
import listImg from '../../assets/list.png'
import profileImg from '../../assets/profile.png'
import searchImg from '../../assets/search.png'

import { SparklesText } from "@/components/magicui/sparkles-text";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { motion } from "motion/react"
import { Link } from 'react-router-dom'

const Navbar = () => {
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
            className='navBar pb-2 pt-3.5 px-1 bg-[#141219] w-full flex justify-center items-center'
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
            <div className='w-[70%] flex justify-between items-center'>
                <div className='ml-2.5 flex gap-2 items-center'>
                    <img src={profileImg} alt="" className='h-7 w-7' />
                    <SparklesText sparklesCount='8' className='text-2xl font-bold '>
                        BookStop
                    </SparklesText>
                </div>

                {/* Search Bar */}
                <div className='flex items-center gap-3'>
                    <div className='relative flex items-center'>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search a book/author..."
                            className='px-4 py-2 pl-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 w-64'
                        />
                        <img src={searchImg} alt="Search" className='absolute left-3 h-4 w-4 opacity-70' />
                    </div>
                    <motion.button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim()}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-100 ${searchQuery.trim()
                            ? 'bg-[#507CDC] hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                        whileHover={searchQuery.trim() ? { scale: 1.05 } : {}}
                        whileTap={searchQuery.trim() ? { scale: 0.95 } : {}}
                    >
                        Search
                    </motion.button>
                </div>

                <div className='mr-2.5 gap-5 flex justify-around items-center'>
                    <Link to='/home'>
                        <button className='navBarBtn'>
                            <img src={homeImg} alt="" className='' />
                            <div className=''>Home</div>
                        </button>
                    </Link>
                    <button className='navBarBtn'>
                        <img src={listImg} alt="" className='' />
                        <div className=''>Library</div>
                    </button>
                    <button className='navBarBtn'>
                        <img src={profileImg} alt="" className='' />
                        <div className=''>Profile</div>
                    </button>
                    <button className='text-[1.2rem] hover:cursor-pointer hover:scale-105 transition-transform duration-100'>
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