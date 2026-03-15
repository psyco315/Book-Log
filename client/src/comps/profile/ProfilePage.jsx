import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { motion } from 'framer-motion';
import { securedApi, publicApi } from '../api';
import { Link } from 'react-router-dom';

import Navbar from '../home/Navbar';
import BookCard from '../BookCard';
import './profilepage.css';
import defaultCover from '../../assets/defCover.png'

const ProfilePage = () => {
    const { currUser, loggedIn } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userStats, setUserStats] = useState({
        booksRead: 0,
        currentlyReading: 0,
        planToRead: 0,
        onHold: 0,
        favorites: 0,
        reviews: 0
    });
    const [userBooks, setUserBooks] = useState({
        read: [],
        reading: [],
        planToRead: [],
        onHold: [],
        notDefined: [],
        favorites: []
    });
    const [favorite, setFavorite] = useState([]);
    const [bookRatings, setBookRatings] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [bookStatuses, setBookStatuses] = useState([]);

    // Fetch book status for a specific book
    const fetchBookStatus = async () => {
        try {
            const response = await securedApi.get(`api/userdata/user/books`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching book status`, error);
            return null;
        }
    };

    // Fetch user reviews and ratings
    const fetchUserReviews = async (userId) => {
        try {
            const response = await publicApi.get(`api/review/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user reviews for ${userId}:`, error);
            return [];
        }
    };

    const fetchUserProfile = async () => {
        if (!loggedIn || !currUser) {
            setLoading(false);
            return;
        }

        try {
            setUserProfile(currUser);

            // Fetch user reviews and ratings
            const reviewsData = await fetchUserReviews(currUser._id || currUser.id);
            setUserReviews(reviewsData.reviews || []);

            // If reviewsData contains books information, process it
            try {
                const status = await fetchBookStatus()
                if (status?.books) {
                    setBookStatuses(status.books)
                }
            } catch (error) {
                console.error('Error fetching book status:', error);
                setError('Failed to load book status. Please try again.');
            }

        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const populateBooks = () => {
        if (bookStatuses.length === 0) return;

        let bookList = {
            read: [],
            reading: [],
            planToRead: [],
            onHold: [],
            favorites: []
        };

        bookStatuses.forEach((book) => {
            const bookVal = {
                bookId: book.bookId,
                isFavourite: book.isFavourite,
                rating: book.rating,
                status: book.status,
                tags: book.tags,
                coverImage: book.coverImage
            };

            if (book.status === 'read') {
                bookList.read.push(bookVal);
            } else if (book.status === 'reading') {
                bookList.reading.push(bookVal);
            } else if (book.status === 'on-hold') {
                bookList.onHold.push(bookVal);
            } else if (book.status === 'plan-to-read') {
                bookList.planToRead.push(bookVal);
            }

            if (book.isFavourite) {
                bookList.favorites.push(bookVal);
            }
        });

        // replace the previous books state with the new categorization
        setUserBooks(bookList);
    }

    // Fetch user profile data
    useEffect(() => {
        fetchUserProfile();
    }, [loggedIn, currUser]);

    useEffect(() => {
        populateBooks();
    }, [bookStatuses]);

    // recalculate statistics whenever the book lists or user reviews change
    useEffect(() => {
        setUserStats({
            booksRead: userBooks.read.length,
            currentlyReading: userBooks.reading.length,
            planToRead: userBooks.planToRead.length,
            onHold: userBooks.onHold.length1,
            favorites: userBooks.favorites.length
        })
    }, [userBooks, userReviews]);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'read', label: 'Read' },
        { id: 'reading', label: 'Currently Reading' },
        { id: 'planToRead', label: 'Plan to Read' },
        { id: 'favorites', label: 'Favorites' },
        { id: 'reviews', label: 'Reviews' }
    ];

    const renderBookGrid = (books, showProgress = false) => {
        if (!books || books.length === 0) {
            return (
                <div className="emptyState">
                    <p>No books found in this category.</p>
                </div>
            );
        }

        return (
            <div className="bookGrid">
                {books.map((book, index) => (
                    <BookCard data={book.bookId} key={index}/>
                ))}
            </div>
        );
    };

    const renderReviews = () => {
        if (!userReviews || userReviews.length === 0) {
            return (
                <div className="emptyState">
                    <p>No reviews written yet.</p>
                </div>
            );
        }

        return (
            <div className="reviewsGrid">
                {userReviews.map((review, index) => (
                    <motion.div
                        key={review.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="reviewCard"
                    >
                        <div className="reviewHeader">
                            <h4 className="reviewBookTitle">{review.bookTitle}</h4>
                            <div className="reviewRating">
                                {'⭐'.repeat(review.rating || 0)}
                            </div>
                        </div>
                        <p className="reviewText">{review.text || review.content}</p>
                        <div className="reviewMeta">
                            <span className="reviewDate">
                                {new Date(review.createdAt || review.date).toLocaleDateString()}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="overviewContent">
                        {/* Stats Grid */}
                        <div className="statsGrid">
                            <div className="statCard">
                                <div className="statNumber">{userStats.booksRead}</div>
                                <div className="statLabel">Books Read</div>
                            </div>
                            <div className="statCard">
                                <div className="statNumber">{userStats.currentlyReading}</div>
                                <div className="statLabel">Reading</div>
                            </div>
                            <div className="statCard">
                                <div className="statNumber">{userStats.planToRead}</div>
                                <div className="statLabel">To Read</div>
                            </div>
                            <div className="statCard">
                                <div className="statNumber">{userStats.favorites}</div>
                                <div className="statLabel">Favorites</div>
                            </div>
                            <div className="statCard">
                                <div className="statNumber">{userStats.reviews}</div>
                                <div className="statLabel">Reviews</div>
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        {userReviews.length > 0 && (
                            <div className="profileSection">
                                <div className="sectionTitle">Recent Reviews</div>
                                <div className="activityCard">
                                    {userReviews.slice(0, 4).map((review, index) => (
                                        <div key={index} className="activityItem">
                                            ⭐ Rated "{review.bookTitle}" {review.rating} stars
                                            {review.text && ` - "${review.text.substring(0, 60)}${review.text.length > 60 ? '...' : ''}"`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Currently Reading Preview */}
                        {userBooks.reading.length > 0 && (
                            <div className="profileSection">
                                <div className="sectionTitle">Currently Reading</div>
                                {renderBookGrid(userBooks.reading.slice(0, 4), true)}
                            </div>
                        )}
                    </div>
                );
            case 'read':
                return renderBookGrid(userBooks.read);
            case 'reading':
                return renderBookGrid(userBooks.reading, true);
            case 'planToRead':
                return renderBookGrid(userBooks.planToRead);
            case 'onHold':
                return renderBookGrid(userBooks.onHold);
            case 'favorites':
                return renderBookGrid(userBooks.favorites);
            case 'reviews':
                return renderReviews();
            default:
                return null;
        }
    };

    if (!loggedIn) {
        return (
            <div className="profilePage">
                <div style={{ position: 'relative' }}>
                    <Navbar />
                </div>
                <div className="profileContentBox">
                    <div className="signInPrompt">
                        <h1>Please sign in to view your profile</h1>
                        <p>You need to be logged in to access your profile page.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="profilePage">
                <Navbar />
                <div className="profileContentBox">
                    <div className="loadingSpinner">
                        <div className="spinner"></div>
                        <p>Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profilePage">
                <Navbar />
                <div className="profileContentBox">
                    <div className="errorMessage">
                        <h2>Error Loading Profile</h2>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profilePage">
            <Navbar />

            <motion.div className="profileContentBox"
                initial={{ opacity: 0, }}
                animate={{ opacity: 1 }}
                transition={{ duration: .6 }}
            >
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="profileHeader"
                >
                    <div className="profileHeaderContent">
                        <div className="profileAvatar">
                            {userProfile?.avatar ? (
                                <img src={userProfile.avatar} alt="Profile" className="avatarImage" />
                            ) : (
                                userProfile?.displayName?.charAt(0) || userProfile?.username?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className="profileInfo">
                            <h1 className="profileName">
                                {userProfile?.displayName || userProfile?.username || 'User'}
                            </h1>
                            <p className="profileEmail">
                                {userProfile?.email || 'user@example.com'}
                            </p>
                            {userProfile?.bio && (
                                <p className="profileBio">{userProfile.bio}</p>
                            )}
                            <div className="profileMetadata">
                                <span className="joinDate">
                                    Joined {new Date(userProfile?.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long'
                                    })}
                                </span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="editProfileBtn"
                        >
                            Edit Profile
                        </motion.button>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <div className="tabNavigation">
                    <div className="tabContainer">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tabBtn ${activeTab === tab.id ? 'tabBtnActive' : ''}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="tabContent"
                >
                    {renderTabContent()}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;