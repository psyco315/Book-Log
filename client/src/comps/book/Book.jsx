import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Navbar from '../home/Navbar'
import StatusModal from './StatusModal' // Import the modal
import { data, useParams } from "react-router-dom";
import { motion } from 'motion/react'
import { fetchBooks, getDesc } from '../getData';
import { imgFunc1, imgFunc2, imgFunc3 } from '../getData';
import { publicApi, securedApi } from '../api';
import { useAuth } from '@/context/auth';
import Lottie from 'react-lottie-player'
import './book.css'

import defCover from '../../assets/defCover.png'
import heart1 from '../../assets/heart1.webp'
import heart2 from '../../assets/heart2.png'
import readList from '../../assets/readList.webp'
import star from '../../assets/star.png'
import star2 from '../../assets/star2.png'
import status from '../../assets/status.webp'
import loadingCover from '../../assets/loadCover.png'
import loadingAnimation from '../../assets/loading_gray.json'
import finishedReading from '../../assets/finished.png'
import reading from '../../assets/reading.png'
import planToRead from '../../assets/plantoread.png'

const Book = () => {
    const { isbn } = useParams();
    const [book, setBook] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(0);
    const [currBook, setCurrBook] = useState(null);
    const [currBookStatus, setCurrBookStatus] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false); // Modal state

    const { currUser } = useAuth()

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
            setIsMobile(width < 991);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const cleanSubjects = (subjects) => {
        if (!Array.isArray(subjects)) return [];

        const result = subjects
            .flatMap(item => item.split(","))
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .filter((s, i, arr) => arr.indexOf(s) === i);

        return result;
    };

    const loadBookAndDescription = async () => {
        if (!isbn) return;

        try {
            const bookData = await fetchBooks({ isbn: isbn });
            if (bookData?.data) {
                const finalData = bookData.data.books[0];
                finalData.subject = cleanSubjects(finalData.subject);
                finalData.description = ''

                if (finalData.ratings_average) {
                    finalData.ratings_average = parseFloat(finalData.ratings_average).toFixed(1);
                }

                setBook(finalData);

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

    const [imgLink, setImgLink] = useState(defCover);
    const [isLoading, setIsLoading] = useState(true);

    const loadCover = async () => {
        try {
            let coverUrl = await imgFunc1(book.title, book.author_name);

            if (!coverUrl) {
                coverUrl = await imgFunc2(book.lccn, book.title);
            }

            if (!coverUrl) {
                coverUrl = await imgFunc3(book.isbn, book.title);
            }

            if (coverUrl) {
                setImgLink(coverUrl);
            }

        } catch (error) {
            console.error('Error loading cover:', error);
            setImgLink(defCover);
        } finally {
            setIsLoading(false);
        }
    };

    const addBookToDb = async (bookData) => {
        try {
            // Send POST request to the API
            const response = await publicApi.post('/api/book/db', bookData);

            // Return successful response
            setCurrBook(response.data.book._id)
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Book added successfully'
            };

        } catch (error) {
            console.error('Error adding book to database:', error);

            // Handle different error types
            if (error.response) {
                // Server responded with error status
                return {
                    success: false,
                    message: error.response.data.message || 'Server error occurred',
                    status: error.response.status,
                    data: error.response.data
                };
            } else if (error.request) {
                // Request was made but no response received
                return {
                    success: false,
                    message: 'No response from server. Please check your connection.',
                    error: 'NETWORK_ERROR'
                };
            } else {
                // Something else happened
                return {
                    success: false,
                    message: 'An unexpected error occurred',
                    error: error.message
                };
            }
        }
    };

    // Function to fetch current book status
    const fetchBookStatus = async (bookId) => {
        try {
            const response = await securedApi.get(`/api/userdata/${bookId}/status`);

            if (response.data.success) {
                setCurrBookStatus(response.data.userBook);
            } else {
                console.log('No status found for this book');
                setCurrBookStatus(null);
            }
        } catch (error) {
            console.error('Error fetching book status:', error);
            // Set to null if no status exists or error occurs
            setCurrBookStatus(null);
        }
    };

    const createBookData = (book, imgLink) => {
        const bookData = {
            title: book?.title,
            author_name: book?.author_name || [],
            isbn: Array.isArray(book?.isbn) ? book.isbn[0] : book?.isbn,
            lccn: book?.lccn || [],
            description: book?.description || "No description available",
            coverImage: imgLink,
            first_publish_year: book?.first_publish_year,
            number_of_pages_median: book?.number_of_pages_median || book?.number_of_pages,
            language: book?.language || [],
            subject: book?.subject || [],
            ratings_average: book?.ratings_average ? parseFloat(book.ratings_average) : null,
            readinglog_count: book?.readinglog_count || 0,
            externalIds: {
                googleBooks: book?.google_books_id || null,
                goodreads: book?.goodreads_id || null,
                openLibrary: book?.key || book?.olid?.[0] || null
            }
        };

        // Clean up null/undefined values
        Object.keys(bookData).forEach(key => {
            if (bookData[key] === null || bookData[key] === undefined ||
                (Array.isArray(bookData[key]) && bookData[key].length === 0)) {
                delete bookData[key];
            }
        });

        // Clean up externalIds
        if (bookData.externalIds) {
            Object.keys(bookData.externalIds).forEach(key => {
                if (bookData.externalIds[key] === null || bookData.externalIds[key] === undefined) {
                    delete bookData.externalIds[key];
                }
            });

            if (Object.keys(bookData.externalIds).length === 0) {
                delete bookData.externalIds;
            }
        }

        return bookData;
    };

    useEffect(() => {
        loadBookAndDescription();
    }, [isbn]);

    useEffect(() => {
        if (book) {
            loadCover();
        }
    }, [book]);

    useEffect(() => {
        if (imgLink !== '/src/assets/defCover.png' && book?.description) {
            const uploadData = createBookData(book, imgLink)
            addBookToDb(uploadData)
        }
    }, [imgLink, book])

    useEffect(() => {
        if (currBook) {
            fetchBookStatus(currBook);
        }
    }, [currBook])

    useEffect(() => {
        if (currBookStatus) {
            // console.log(currBookStatus)
        }

    }, [currBookStatus])


    // Handle status update
    const handleStatusUpdate = async (statusData, isbn) => {
        try {
            const token = localStorage.getItem('authToken'); // Adjust based on how you store auth token
            // console.log(isbn)

            const response = await securedApi.post(
                `/api/userdata/${isbn}/status`,
                statusData
            );

            const result = response.data;

            if (result.success) {
                console.log('Status updated successfully:', result);
                // Update the current book status state
                setCurrBookStatus(result.userBook);
                // You can add success notification here
            } else {
                throw new Error(result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            throw error; // Re-throw to let modal handle the error
        }
    };

    if (!book) return <p>Loading...</p>;

    return (
        <div className='globalDiv'>
            <Navbar />

            <motion.div className='contentParent'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className='photoCol'>
                    {isLoading ? (
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
                    ) : (
                        <motion.img
                            src={imgLink}
                            alt={book.title}
                        />
                    )}

                    <div className='altDesc'>
                        <div className={`title ${isMobile ? '' : 'hidden'}`}>
                            {book.title}
                        </div>

                        <div className={`author ${isMobile ? '' : 'hidden'}`}>
                            {book?.author_name?.map((author, idx) => (
                                <span key={idx}>
                                    {author}
                                    {idx < book.author_name.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </div>

                        <div className={`pubYear ${isMobile ? '' : 'hidden'}`}>
                            First Publish: {book.first_publish_year || "Unavailable"}
                        </div>
                    </div>
                </div>

                <div className='descCol'>
                    <div className={`title ${isMobile ? 'hidden' : ''}`}>
                        {book.title}
                    </div>

                    <div className={`author ${isMobile ? 'hidden' : ''}`}>
                        {book?.author_name?.map((author, idx) => (
                            <span key={idx}>
                                {author}
                                {idx < book.author_name.length - 1 ? ", " : ""}
                            </span>
                        ))}
                    </div>

                    <div className='descBox'>
                        <div className={`pubYear ${isMobile ? 'hidden' : ''}`}>
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
                </div>

                <div className='rateCol'>
                    <div className='userBox bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30'>
                        <div className='logBtnList flex justify-around'>
                            <button
                                className='logBtn'
                                onClick={() => setIsStatusModalOpen(true)}
                            >
                                <img
                                    src={
                                        currBookStatus?.status === "plan-to-read"
                                            ? planToRead
                                            : currBookStatus?.status === "reading"
                                                ? reading
                                                : currBookStatus?.status === "read"
                                                    ? finishedReading
                                                    : status // default icon if no status
                                    }
                                    alt="status icon"
                                />
                                <div>
                                    {currBookStatus?.status
                                        ? currBookStatus.status === "plan-to-read"
                                            ? "Plan to Read"
                                            : currBookStatus.status === "reading"
                                                ? "Reading"
                                                : currBookStatus.status === "read"
                                                    ? "Finished"
                                                    : "Not Set"
                                        : "Set Status"}
                                </div>
                            </button>

                            <button className='logBtn'>
                                <img src={heart1} alt="" />
                                <div>Favourite?</div>
                            </button>

                            <button className='logBtn'>
                                <img src={readList} alt="" />
                                <div>Add to List</div>
                            </button>
                        </div>

                        <div className='rateStarBox flex flex-col items-center'>
                            <div className='flex justify-around'>
                                <img src={star} alt="" />
                                <img src={star} alt="" />
                                <img src={star} alt="" />
                                <img src={star} alt="" />
                                <img src={star} alt="" />
                            </div>
                            <button>Rate</button>
                        </div>

                        <div className='postRev'>
                            Post review
                        </div>
                    </div>

                    <div className='ratingBox bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30'>
                        <div>
                            <div>Average Rating</div>
                            <div className='flex justify-center items-center'>
                                <img src={star2} alt="" />
                                <div>{book.ratings_average}</div>
                            </div>
                        </div>
                        <div>
                            <div>BookStop Rating</div>
                            <div className='flex justify-center items-center'>
                                <img src={star2} alt="" />
                                <div>{book.ratings_average}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Status Modal */}
            <StatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                book={book}
                currentStatus={currBookStatus}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    )
}

export default Book