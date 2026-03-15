import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { fetchBooks } from './getData';
import { motion } from 'motion/react'
import { Link } from 'react-router-dom';
import Lottie from 'react-lottie-player'
import { BorderBeam } from "@/components/magicui/border-beam";
// import { imgFunc1, imgFunc2, imgFunc3 } from './getData';
import defaultCover from '../assets/defCover.png'
import loadingCover from '../assets/loadCover.png'
import loadingAnimation from '../assets/loading_gray.json'

import './home/HomePage.css'


const BookCard = ({ data }) => {
    const {
        author_name,
        title,
        isbn
    } = data;

    if (!isbn || isbn.length === 0) {
        return
    }

    const [imgLink, setImgLink] = useState(defaultCover);
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const loadBook = async () => {
        try {
            const bookData = await fetchBooks({ isbn: isbn });
            if (bookData?.data) {
                const finalData = bookData.data.books[0];

                if (finalData.ratings_average) {
                    finalData.ratings_average = parseFloat(finalData.ratings_average).toFixed(1);
                }

                setImgLink(finalData.coverImage)
                setIsLoading(false)
            }
        } catch (err) {
            console.error("Failed to fetch book:", err);
        }
    }

    useEffect(() => {
        loadBook();
    }, [title, author_name]);

    return (
        <Link to={`/book/${isbn}`} className=' flex-shrink-0'>
            <motion.div className='inline-block relative overflow-hidden flex-shrink-0 cursor-pointer w-fit'>
                <div className='group relative w-full h-full'
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >


                    {
                        isLoading ?
                            <div
                                className="loadCover flex items-center justify-center bg-cover bg-center"
                                style={{ backgroundImage: `url(${loadingCover})` }}
                            >
                                <Lottie
                                    loop
                                    animationData={loadingAnimation}
                                    play
                                    className='loadAni'
                                />
                            </div>

                            :
                            <motion.img
                                src={imgLink}
                                alt={title}
                                className='cardCover hover-trigger'
                                animate={{ scale: isHovered ? 1.05 : 1 }}
                                transition={{ duration: 0.3 }}
                            />
                    }

                    {/* Glassmorphic overlay */}
                    <motion.div
                        className='cardInfo absolute inset-0 bg-black/20 backdrop-blur-md border border-white/30 
                           flex flex-col justify-center items-center text-white text-center
                           opacity-0 group-hover:opacity-100 transition-all duration-300'
                        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className='drop-shadow-lg'>
                            {title}
                        </h3>
                        <p className='drop-shadow-md'>
                            {Array.isArray(author_name) ? author_name.join(', ') : author_name}
                        </p>

                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-[#507CDC] to-transparent"
                        />
                        <BorderBeam
                            duration={6}
                            delay={3}
                            size={200}
                            className="from-transparent via-[#FFE434] to-transparent"
                        />
                    </motion.div>
                </div>
            </motion.div>
        </Link>
    )
}

export default BookCard

