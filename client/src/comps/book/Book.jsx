import React, { useState, useEffect } from 'react'
import Navbar from '../home/Navbar'
import { useParams } from "react-router-dom";
import { motion } from 'motion/react'
import { fetchBooks, getDesc } from '../getData';
import './book.css'

import defCover from '../../assets/defCover.png'
import heart1 from '../../assets/heart1.webp'
import heart2 from '../../assets/heart2.png'
import readList from '../../assets/readList.webp'
import star from '../../assets/star.png'
import star2 from '../../assets/star2.png'
import status from '../../assets/status.webp'
import { title } from 'process';

const Book = () => {
    const { isbn } = useParams();   // 👈 get isbn from URL
    const [book, setBook] = useState(null);

    const cleanSubjects = (subjects) => {
        if (!Array.isArray(subjects)) return [];

        const result = subjects
            .flatMap(item => item.split(","))   // split comma-separated values
            .map(s => s.trim())                 // remove extra spaces
            .filter(s => s.length > 0)          // remove empties
            .map(s => s.charAt(0).toUpperCase() + s.slice(1)) // normalize case
            .filter((s, i, arr) => arr.indexOf(s) === i); // remove duplicates

        return result;
    };

    useEffect(() => {
        const loadBookAndDescription = async () => {
            if (!isbn) return;

            try {
                // First, load the book
                const bookData = await fetchBooks({ isbn: isbn });
                if (bookData?.data) {
                    const finalData = bookData.data.books[0];
                    finalData.subject = cleanSubjects(finalData.subject);

                    // Round ratings_average to 1 decimal place
                    if (finalData.ratings_average) {
                        finalData.ratings_average = parseFloat(finalData.ratings_average).toFixed(1);
                    }

                    console.log(finalData)
                    setBook(finalData);

                    // Then load description using the book data we just got
                    try {
                        const descData = await getDesc(finalData.title, finalData.author_name);
                        if (descData) {
                            setBook(prev => ({
                                ...prev,
                                description: typeof descData.description === "string"
                                    ? descData.description
                                    : descData.description?.value || "No description available",
                            }));
                        }
                    } catch (err) {
                        console.error("Failed to fetch description:", err);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch book:", err);
            }
        };

        loadBookAndDescription();
    }, [isbn]);

    if (!book) return <p>Loading...</p>;

    return (
        <div className='globalDiv flex flex-col items-center'>
            <Navbar />

            <motion.div className='contentParent'
                initial={{
                    opacity: 0
                }}
                animate={{
                    opacity: 1
                }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut"
                }}
            >
                <div className='photoCol flex flex-col items-center'>
                    <img src={defCover} alt="" />
                    <div>Click to see more covers</div>
                </div>

                {/* -------------------------------------------------------------------------------------------------------------------- */}

                <div className='descCol'>
                    <div className='title'>
                        {book.title}
                    </div>

                    <div className="author">
                        {book?.author_name?.map((author, idx) => (
                            <span key={idx}>
                                {author}
                                {idx < book.author_name.length - 1 ? ", " : ""}
                            </span>
                        ))}
                    </div>

                    <div className='descBox'>
                        <div className='pubYear'>
                            First Publish: {book.first_publish_year || "Unavailable"}
                        </div>
                        <div className='description'>
                            {book.description}
                        </div>
                    </div>

                    <div className='genreBox'>
                        <div className='genreTitle'>Genre</div>
                        <div className='genreList flex flex-wrap '>
                            {book.subject.map((genre, index) => (
                                <div
                                    key={index}
                                    className="genreItem text-black bg-[#AEAEAE] hover:text-white/70 hover:bg-[#565656] hover:cursor-pointer"
                                >
                                    {genre}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='comments'>
                        comments
                    </div>
                </div>

                {/* -------------------------------------------------------------------------------------------------------------------- */}

                <div className='rateCol flex flex-col items-center gap-4'>
                    <div className='userBox flex flex-col items-center bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30'>
                        <div className='logBtnList flex justify-around'>
                            <button className='logBtn'>
                                <img src={status} alt="" />
                                <div>
                                    Status
                                </div>
                            </button>

                            <button className='logBtn'>
                                <img src={heart1} alt="" />
                                <div>
                                    Favourite?
                                </div>
                            </button>

                            <button className='logBtn'>
                                <img src={readList} alt="" />
                                <div>
                                    Add to List
                                </div>
                            </button>
                        </div>

                        <div className='rateStarBox flex flex-col items-center'>
                            <div className=' flex justify-around'>
                                <img src={star} alt="" />
                                <img src={star} alt="" />
                                <img src={star} alt="" />
                                <img src={star} alt="" />
                                <img src={star} alt="" />
                            </div>

                            <button>
                                Rate
                            </button>
                        </div>

                        <div className='postRev'>
                            Post review
                        </div>
                    </div>

                    <div className='ratingBox flex flex-col items-center bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30'>
                        <div>
                            Average Rating
                        </div>
                        <div className='flex justify-center items-center'>
                            <img src={star2} alt="" />
                            <div>{book.ratings_average}</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Book