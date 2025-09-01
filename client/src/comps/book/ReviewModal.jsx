import React, { useState, useEffect } from 'react';

const ReviewModal = ({ isOpen, onClose, book, onSubmitReview }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        // Must have content for a written review
        if (!content.trim()) {
            newErrors.general = 'Please write a review';
        }

        // If written review exists, title is required
        if (content.trim() && !title.trim()) {
            newErrors.title = 'Title is required when writing a review';
        }

        // Content length validation
        if (content && content.length > 5000) {
            newErrors.content = 'Review content cannot exceed 5000 characters';
        }

        // Title length validation
        if (title && title.length > 200) {
            newErrors.title = 'Title cannot exceed 200 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const reviewData = {
            bookId: book._id || book.id,
            title: title.trim() || undefined,
            content: content.trim() || undefined
        };

        onSubmitReview(reviewData)
            .then(() => {
                // Reset form and close modal on success
                setTitle('');
                setContent('');
                setRating(0);
                setErrors({});
                onClose();
            })
            .catch((error) => {
                console.error('Error submitting review:', error);
                setErrors({
                    general: error.response?.data?.message || 'Failed to submit review. Please try again.'
                });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setErrors({});
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-600 w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Write a Review</h2>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Book info */}
                    <div className="mt-3 text-sm text-gray-300">
                        <div className="font-medium">{book?.title}</div>
                        <div>{book?.author_name?.join(', ')}</div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* General Error */}
                    {errors.general && (
                        <div className="p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-200 text-sm">
                            {errors.general}
                        </div>
                    )}

                    {/* Title Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title {content.trim() && <span className="text-red-400">*</span>}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your review a title..."
                            maxLength={200}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between items-center mt-1">
                            {errors.title && (
                                <p className="text-red-400 text-xs">{errors.title}</p>
                            )}
                            <span className="text-gray-400 text-xs ml-auto">{title.length}/200</span>
                        </div>
                    </div>

                    {/* Content Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Review (optional)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts about this book..."
                            rows={6}
                            maxLength={5000}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none"
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between items-center mt-1">
                            {errors.content && (
                                <p className="text-red-400 text-xs">{errors.content}</p>
                            )}
                            <span className="text-gray-400 text-xs ml-auto">{content.length}/5000</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                'Post Review'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;