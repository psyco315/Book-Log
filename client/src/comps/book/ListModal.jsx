import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { securedApi } from '../api';
import { useAuth } from '@/context/auth';
import Lottie from 'react-lottie-player';
import loadingAnimation from '../../assets/loading_gray.json';

const ListModal = ({ isOpen, onClose, book, currBook }) => {
    const [userLists, setUserLists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { currUser } = useAuth();

    // Fetch user's lists
    const fetchUserLists = async () => {
        if (!currUser || !isOpen) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await securedApi.get(`/api/list/user/${currUser._id}`);
            
            if (response.data.success) {
                // Check which lists contain the current book
                const listsWithBookStatus = await Promise.all(
                    response.data.lists.map(async (list) => {
                        try {
                            const bookInListResponse = await securedApi.get(
                                `/api/list/${list._id}/books/${currBook}`
                            );
                            return {
                                ...list,
                                containsBook: bookInListResponse.data.containsBook || false
                            };
                        } catch (error) {
                            return {
                                ...list,
                                containsBook: false
                            };
                        }
                    })
                );
                
                setUserLists(listsWithBookStatus);
            } else {
                setError('Failed to load lists');
            }
        } catch (error) {
            console.error('Error fetching user lists:', error);
            setError('Failed to load lists');
            setUserLists([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle adding/removing book from list
    const handleListToggle = async (listId, currentlyInList) => {
        if (!currBook || isSubmitting) return;

        setIsSubmitting(true);

        try {
            if (currentlyInList) {
                // Remove book from list
                const response = await securedApi.delete(
                    `/api/list/${listId}/books/${currBook}`
                );

                if (response.data.success) {
                    setUserLists(prev => 
                        prev.map(list => 
                            list._id === listId 
                                ? { ...list, containsBook: false }
                                : list
                        )
                    );
                } else {
                    throw new Error(response.data.message || 'Failed to remove from list');
                }
            } else {
                // Add book to list
                const response = await securedApi.post(
                    `/api/list/${listId}/books`,
                    { bookId: currBook }
                );

                if (response.data.success) {
                    setUserLists(prev => 
                        prev.map(list => 
                            list._id === listId 
                                ? { ...list, containsBook: true }
                                : list
                        )
                    );
                } else {
                    throw new Error(response.data.message || 'Failed to add to list');
                }
            }
        } catch (error) {
            console.error('Error updating list:', error);
            setError(error.message || 'Failed to update list');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isOpen && currBook) {
            fetchUserLists();
        }
    }, [isOpen, currBook, currUser]);

    const handleClose = () => {
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className="bg-gradient-to-br from-[#2B2832] to-[#201D24] text-white rounded-2xl shadow-2xl border border-white/20 max-w-md w-full max-h-[80vh] overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Add to Lists</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        {book && (
                            <p className="text-sm text-gray-300 mt-2 truncate">
                                {book.title} by {book.author_name?.[0]}
                            </p>
                        )}
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-140px)]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Lottie
                                    loop
                                    animationData={loadingAnimation}
                                    play
                                    style={{ width: 60, height: 60 }}
                                />
                                <p className="text-gray-400 mt-2">Loading lists...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={fetchUserLists}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : userLists.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">No lists found</p>
                                <p className="text-sm text-gray-500">Create your first list to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {userLists.map((list) => (
                                    <div
                                        key={list._id}
                                        className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{list.name}</h3>
                                            <p className="text-sm text-gray-400 truncate">
                                                {list.description || 'No description'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {list.books?.length || 0} books
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleListToggle(list._id, list.containsBook)}
                                            disabled={isSubmitting}
                                            className={`
                                                px-4 py-2 rounded-lg font-medium transition-all duration-200 ml-3 min-w-[80px]
                                                ${list.containsBook
                                                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                                                    : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                                                }
                                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                                            `}
                                        >
                                            {isSubmitting ? '...' : (list.containsBook ? 'Remove' : 'Add')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-white/10">
                        <button
                            disabled
                            className="w-full px-4 py-2 bg-gray-500/30 text-gray-400 rounded-lg cursor-not-allowed"
                        >
                            Create New List (Coming Soon)
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ListModal;