import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Navbar from '../home/Navbar'
import StatusModal from './StatusModal' // Import the modal
import { data, useParams } from "react-router-dom";
import { motion } from 'motion/react'
import { Link } from 'react-router-dom';
import { fetchBooks, getDesc } from '../getData';
import { imgFunc1, imgFunc2, imgFunc3 } from '../getData';
import { publicApi, securedApi } from '../api';
import { useAuth } from '@/context/auth';
import Lottie from 'react-lottie-player'
import StarRatingBox from './StarRatingBox';
import ReviewModal from './ReviewModal';
import LoadingScreen from './LoadingScreen';
import ListModal from './ListModal';
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
import hold from '../../assets/hold.webp'

const Book = () => {
    const { isbn } = useParams();
    const [book, setBook] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(0);
    const [currBook, setCurrBook] = useState(null);
    const [currBookStatus, setCurrBookStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false); // Modal state
    const [userRating, setUserRating] = useState(0);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    const { currUser, loggedIn } = useAuth()

    // Fetch existing review for the current user and book
    const fetchExistingReview = async (bookId) => {
        if (!loggedIn || !currUser || !bookId) return;

        try {
            const response = await securedApi.get(`/api/review?bookId=${bookId}&userId=${currUser._id}`);

            if (response.data.reviews && response.data.reviews.length > 0) {
                const review = response.data.reviews[0];
                setExistingReview(review);
                setUserRating(review.rating || 0);
            } else {
                setExistingReview(null);
                setUserRating(0);
            }
        } catch (error) {
            console.error('Error fetching existing review:', error);
            setExistingReview(null);
            setUserRating(0);
        }
    };

    // Handle rating-only submission (when star is clicked)
    const handleRatingSubmission = async (newRating) => {
        if (!loggedIn || !currUser || !currBook) {
            console.log('User not logged in or book not loaded');
            return;
        }

        setIsRatingSubmitting(true);

        try {
            if (existingReview) {
                // Update existing review with new rating
                // console.log(newRating)
                const response = await securedApi.put(`/api/review/${existingReview._id}`, {
                    rating: newRating,
                    title: existingReview.title || '',
                    content: existingReview.content || ''
                });

                if (response.data.review) {
                    setExistingReview(response.data.review);
                    console.log('Rating updated successfully');
                }
            } else {
                // Create new review with only rating
                const reviewData = {
                    bookId: currBook,
                    rating: newRating
                };

                const response = await securedApi.post('/api/review', reviewData);

                if (response.data.review) {
                    setExistingReview(response.data.review);
                    console.log('Rating submitted successfully');
                }
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            // Revert rating on error
            setUserRating(existingReview?.rating || 0);
        } finally {
            setIsRatingSubmitting(false);
        }
    };

    const handleRatingChange = (newRating) => {
        setUserRating(newRating);
        handleRatingSubmission(newRating);
    };

    // Handle favorite toggle
    const handleFavoriteToggle = async () => {
        if (!loggedIn || !currUser || !book) {
            console.log('User not logged in or book not loaded');
            return;
        }

        setIsFavoriteSubmitting(true);

        try {
            console.log("Old favorite:", currBookStatus?.isFavorite)
            const bookIsbn = Array.isArray(book.isbn) ? book.isbn[0] : book.isbn;
            const newFavoriteStatus = !currBookStatus?.isFavorite;
            console.log("Changing favorite to:", newFavoriteStatus)

            const response = await securedApi.put(`/api/userdata/${bookIsbn}/status`, {
                userId: currUser,
                isFavorite: newFavoriteStatus
            });

            if (response.data.success) {
                fetchBookStatus(currBook)
                console.log('Favorite changed to:', newFavoriteStatus);
            } else {
                throw new Error(response.data.message || 'Failed to update favorite status');
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
            // Revert state on error
            setIsFavorite(!isFavorite);
        } finally {
            setIsFavoriteSubmitting(false);
        }
    };

    // Handle review submission from modal
    const handleSubmitReview = async (reviewData) => {
        try {
            if (existingReview) {
                // Update existing review
                const response = await securedApi.put(`/api/review/${existingReview._id}`, {
                    ...reviewData,
                    rating: userRating || reviewData.rating || existingReview.rating
                });

                if (response.data.review) {
                    setExistingReview(response.data.review);
                    console.log('Review updated successfully');
                }

                return response.data;
            } else {
                // Create new review
                const fullReviewData = {
                    ...reviewData,
                    bookId: currBook,
                    rating: userRating || reviewData.rating
                };

                const response = await securedApi.post('/api/review', fullReviewData);

                if (response.data.review) {
                    setExistingReview(response.data.review);
                    console.log('Review created successfully');
                }

                return response.data;
            }
        } catch (error) {
            console.error('Failed to submit review:', error);
            throw error;
        }
    };

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
            const response = await publicApi.post('/api/book/db', bookData);
            setCurrBook(response.data.book._id)
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Book added successfully'
            };

        } catch (error) {
            console.error('Error adding book to database:', error);

            if (error.response) {
                return {
                    success: false,
                    message: error.response.data.message || 'Server error occurred',
                    status: error.response.status,
                    data: error.response.data
                };
            } else if (error.request) {
                return {
                    success: false,
                    message: 'No response from server. Please check your connection.',
                    error: 'NETWORK_ERROR'
                };
            } else {
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
                // Set favorite status from the fetched data
                setIsFavorite(response.data.userBook?.isFavourite || false);
            } else {
                console.log('No status found for this book');
                setCurrBookStatus(null);
                setIsFavorite(false);
            }
        } catch (error) {
            console.error('Error fetching book status:', error);
            setCurrBookStatus(null);
            setIsFavorite(false);
        }
        finally {
            setStatusLoading(false)
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
            // console.log(book)
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
            fetchExistingReview(currBook);
        }
    }, [currBook, loggedIn])

    useEffect(() => {
        if (currBookStatus) {
            setIsFavorite(currBookStatus?.isFavorite)
        }
    }, [currBookStatus])

    // Handle status update
    const handleStatusUpdate = async (statusData, isbn) => {
        try {
            const response = await securedApi.post(
                `/api/userdata/${isbn}/status`,
                statusData
            );

            const result = response.data;

            if (result.success) {
                console.log('Status updated successfully:', result);
                setCurrBookStatus(result.userBook);
            } else {
                throw new Error(result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    };

    if (!book) return <LoadingScreen />;

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
                                <Link to={`/search?subject=${genre}`}>
                                    <div
                                        key={index}
                                        className="genreItem text-black bg-[#AEAEAE] hover:text-white/70 hover:bg-[#565656] hover:cursor-pointer"
                                    >
                                        {genre}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='rateCol'>
                    {statusLoading && loggedIn ? (
                        // Show loading animation while status is being fetched
                        <div className='flex justify-center items-center min-h-[200px]'>
                            <Lottie
                                loop
                                animationData={loadingAnimation}
                                play
                                style={{ width: 100, height: 100 }}
                            />
                        </div>
                    ) : (
                        <>
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
                                                            : currBookStatus?.status === 'on-hold'
                                                                ? hold
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
                                                            : currBookStatus.status === 'on-hold'
                                                                ? "On hold"
                                                                : "Not Set"
                                                : "Set Status"}
                                        </div>
                                    </button>

                                    <button
                                        className='logBtn'
                                        onClick={handleFavoriteToggle}
                                        disabled={isFavoriteSubmitting}
                                        style={{ opacity: isFavoriteSubmitting ? 0.5 : 1 }}
                                    >
                                        <img src={isFavorite ? heart2 : heart1} alt="" />
                                        <div>{isFavorite ? 'Favourite!' : 'Favourite?'}</div>
                                    </button>

                                    <button
                                        className='logBtn'
                                        onClick={() => setIsListModalOpen(true)}
                                    >
                                        <img src={readList} alt="" />
                                        <div>Add to List</div>
                                    </button>
                                </div>

                                <div className='rateStarBox flex flex-col items-center'>
                                    <StarRatingBox
                                        currentRating={userRating}
                                        onRatingChange={handleRatingChange}
                                        starImage={star2}
                                        disabled={isRatingSubmitting}
                                    />
                                    <div style={{ opacity: isRatingSubmitting ? 0.5 : 1 }}>
                                        {isRatingSubmitting ? 'Saving...' : 'Rate'}
                                    </div>
                                </div>

                                <div
                                    className='postRev'
                                    onClick={() => setIsReviewModalOpen(true)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {existingReview?.content ? 'Edit Review' : 'Post Review'}
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
                        </>
                    )}
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

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                book={{ ...book, _id: currBook }}
                currentRating={userRating}
                existingReview={existingReview}
                onSubmitReview={handleSubmitReview}
            />

            <ListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                book={book}
                currBook={currBook}
            />
        </div>
    )
}

export default Book