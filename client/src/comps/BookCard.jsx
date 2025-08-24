import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import Lottie from 'react-lottie-player'
import { BorderBeam } from "@/components/magicui/border-beam";
import { imgFunc1, imgFunc2 } from './getData';
import defaultCover from '../assets/defCover.png'
import loadCover from '../assets/loadCover.png'
import loadingAnimation from '../assets/loading_gray.json'


const BookCard = ({ data }) => {
    const {
        author_key,
        author_name,
        first_publish_year,
        language,
        number_of_pages_median,
        title,
        subject,
        person,
        ratings_average,
        readinglog_count,
        subject_key,
        lccn
    } = data;

    const [imgLink, setImgLink] = useState(defaultCover);
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const loadCover = async () => {
            try {
                setIsLoading(true);
                let coverUrl = await imgFunc1(title, author_name);

                if (!coverUrl) {
                    coverUrl = await imgFunc2(lccn, title);
                }

                if (coverUrl) {
                    console.log("Final:", title, "-", coverUrl)
                    setImgLink(coverUrl);
                }

            } catch (error) {
                console.error('Error loading cover:', error);
                setImgLink(defaultCover);
            } finally {
                setIsLoading(false);
            }
        };

        loadCover();
    }, [lccn, title, author_name]);

    return (
        <motion.div className='inline-block relative overflow-hidden flex-shrink-0 cursor-pointer w-fit'>
            <div className='group relative w-full h-full'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >


                {
                    isLoading ?
                        <div
                            className="loadCover flex items-center justify-center bg-cover bg-center"
                            style={{ backgroundImage: `url(${loadCover})` }}
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
                    transition={{ duration: 0.05 }}
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
    )
}

export default BookCard

