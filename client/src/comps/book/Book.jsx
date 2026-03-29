import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Navbar from '../home/Navbar'
import StatusModal from './StatusModal' // Import the modal
import { data, useParams } from "react-router-dom";
import { motion } from 'motion/react'
import { Link } from 'react-router-dom';
import { fetchBooks, getDesc } from '../getData';
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
    const [userBook, setUserBook] = useState(null);

    const { currUser, loggedIn } = useAuth()


    useEffect(() => {
        const fetchUserBook = async () => {
            try {
                const data = await securedApi.get(`/api/userdata/${currBook}/status`)
                if (data.data.userBook) {
                    setUserBook(data.data.userBook._id);
                }
            } catch (err) {
                console.error("Failed to fetch userBook:", err);
            }
        };

        if (currBook) fetchUserBook();
    }, [currBook]);

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
                    userBookId: userBook,
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
            const bookIsbn = book.isbn;
            const newFavoriteStatus = !currBookStatus?.isFavorite;

            const response = await securedApi.put(`/api/userdata/${bookIsbn}/status`, {
                userId: currUser,
                isFavorite: newFavoriteStatus
            });

            if (response.data.success) {
                fetchBookStatus(currBook)
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
                    userBookId: userBook,
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


    const loadBookAndDescription = async () => {
        if (!isbn) return;

        try {
            const bookData = await fetchBooks({ isbn: isbn });
            if (bookData?.data) {
                const finalData = bookData.data.books[0];

                setCurrBook(finalData._id)
                setBook(finalData);
            }
        } catch (err) {
            console.error("Failed to fetch book:", err);
        }
    };

    const [imgLink, setImgLink] = useState(defCover);
    const [isLoading, setIsLoading] = useState(true);

    const loadCover = async () => {
        setImgLink(book.coverImage);
        setIsLoading(false);
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

    useEffect(() => {
        loadBookAndDescription();
    }, [isbn]);

    useEffect(() => {
        if (book) {
            loadCover();
        }
    }, [book]);

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

            let result = response.data;

            if (result.success) {
                result.userBook.progress.totalPages = result.userBook.bookId.pageCount
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
                            {book?.authors?.map((author, idx) => (
                                <span key={idx}>
                                    {author}
                                    {idx < book.authors.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </div>

                        <div className={`pubYear ${isMobile ? '' : 'hidden'}`}>
                            First Publish: {book.publishedDate}
                        </div>
                    </div>
                </div>

                <div className='descCol'>
                    <div className={`title ${isMobile ? 'hidden' : ''}`}>
                        {book.title}
                    </div>

                    <div className={`author ${isMobile ? 'hidden' : ''}`}>
                        {book?.authors?.map((author, idx) => (
                            <span key={idx}>
                                {author}
                                {idx < book.authors.length - 1 ? ", " : ""}
                            </span>
                        ))}
                    </div>

                    <div className='descBox'>
                        <div className={`pubYear ${isMobile ? 'hidden' : ''}`}>
                            First Publish: {book.publishedDate}
                        </div>
                        <div className='description'>
                            {book.description}
                        </div>
                    </div>

                    <div className='genreBox'>
                        <div className='genreTitle'>Genre</div>
                        <div className='genreList flex flex-wrap '>
                            {book.subject.map((genre, index) => (
                                <Link to={`/search?subject=${genre}`} key={index}>
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
                                        <div>{book.averageRating}</div>
                                    </div>
                                </div>
                                <div>
                                    <div>BookStop Rating</div>
                                    <div className='flex justify-center items-center'>
                                        <img src={star2} alt="" />
                                        <div>{book.averageRating}</div>
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