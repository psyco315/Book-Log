import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { motion } from 'framer-motion';
import { securedApi } from '../api';

import Navbar from '../home/Navbar';
import './ProfilePage.css';

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
        favorites: 0,
        reviews: 0
    });
    const [userBooks, setUserBooks] = useState({
        read: [],
        reading: [],
        planToRead: [],
        favorites: []
    });

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!loggedIn || !currUser) {
                setLoading(false);
                return;
            }

            setUserProfile(currUser);

            // You can also fetch user stats and books here
            // For now, keeping the mock data for stats and books
            setUserStats({
                booksRead: 42,
                currentlyReading: 3,
                planToRead: 15,
                favorites: 8,
                reviews: 12
            });

            setUserBooks({
                read: [
                    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", cover: "/api/placeholder/200/300" },
                    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", cover: "/api/placeholder/200/300" },
                    { id: 3, title: "1984", author: "George Orwell", cover: "/api/placeholder/200/300" }
                ],
                reading: [
                    { id: 4, title: "Dune", author: "Frank Herbert", cover: "/api/placeholder/200/300", progress: 65 },
                    { id: 5, title: "The Hobbit", author: "J.R.R. Tolkien", cover: "/api/placeholder/200/300", progress: 23 }
                ],
                planToRead: [
                    { id: 6, title: "Pride and Prejudice", author: "Jane Austen", cover: "/api/placeholder/200/300" },
                    { id: 7, title: "The Catcher in the Rye", author: "J.D. Salinger", cover: "/api/placeholder/200/300" }
                ],
                favorites: [
                    { id: 8, title: "Lord of the Rings", author: "J.R.R. Tolkien", cover: "/api/placeholder/200/300" },
                    { id: 9, title: "Harry Potter Series", author: "J.K. Rowling", cover: "/api/placeholder/200/300" }
                ]
            });

            setLoading(false)
        };

        fetchUserProfile();
    }, [loggedIn, currUser]);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'read', label: 'Read' },
        { id: 'reading', label: 'Currently Reading' },
        { id: 'planToRead', label: 'Plan to Read' },
        { id: 'favorites', label: 'Favorites' }
    ];

    const renderBookGrid = (books, showProgress = false) => {
        return (
            <div className="bookGrid">
                {books.map((book, index) => (
                    <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bookCard"
                    >
                        <div className="bookCardImageContainer">
                            {/* <img
                                src={book.cover}
                                alt={book.title}
                                className="bookCardImage"
                                onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/200x300/444/fff?text=${encodeURIComponent(book.title)}`;
                                }}
                            /> */}
                            {showProgress && book.progress && (
                                <div className="progressOverlay">
                                    {book.progress}% Complete
                                </div>
                            )}
                        </div>
                        <div className="bookCardInfo">
                            <h3 className="bookCardTitle">{book.title}</h3>
                            <p className="bookCardAuthor">{book.author}</p>
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

                        {/* Recent Activity */}
                        <div className="profileSection">
                            <div className="sectionTitle">Recent Activity</div>
                            <div className="activityCard">
                                <div className="activityItem">📖 Started reading "Dune" by Frank Herbert</div>
                                <div className="activityItem">⭐ Rated "The Great Gatsby" 5 stars</div>
                                <div className="activityItem">❤️ Added "Pride and Prejudice" to favorites</div>
                                <div className="activityItem">✅ Finished reading "1984" by George Orwell</div>
                            </div>
                        </div>

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
            case 'favorites':
                return renderBookGrid(userBooks.favorites);
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
                initial={{ opacity: 0,}}
                animate={{ opacity: 1}}
                transition={{duration:.6}}
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