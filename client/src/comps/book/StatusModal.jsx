import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import './book.css';
import './statusmodal.css'
import AuthModal from '../auth.js/AuthModal';

const StatusModal = ({ isOpen, onClose, book, currentStatus, onStatusUpdate }) => {
    const { currUser, loggedIn, authModal, setAuthModal } = useAuth(); // Add loggedIn from useAuth
    const [formData, setFormData] = useState({
        status: 'undefined',
        notes: '',
        tags: [],
        currentPage: '',
        totalPages: book?.number_of_pages_median || ''
    });
    const [newTag, setNewTag] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens with book data
    useEffect(() => {
        if (isOpen && book) {
            setFormData({
                status: currentStatus?.status || 'undefined',
                notes: currentStatus?.notes || '',
                tags: currentStatus?.tags || [],
                currentPage: currentStatus?.progress?.currentPage || '',
                totalPages: currentStatus?.progress?.totalPages || book?.number_of_pages_median || ''
            });
        }
    }, [isOpen, book, currentStatus]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                userId: currUser.id,
                status: formData.status,
                notes: formData.notes || undefined,
                tags: formData.tags.length > 0 ? formData.tags : undefined,
                currentPage: formData.currentPage ? parseInt(formData.currentPage) : undefined,
                totalPages: formData.totalPages ? parseInt(formData.totalPages) : undefined
            };

            // Remove undefined values
            Object.keys(payload).forEach(key =>
                payload[key] === undefined && delete payload[key]
            );

            await onStatusUpdate(payload, book?.isbn?.[0] || book?.isbn);
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update book status. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || authModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Update Reading Status</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <div className="book-info">
                    <h4>{book?.title}</h4>
                    <p>{book?.author_name?.join(', ')}</p>
                </div>

                {!loggedIn ? (
                    // Show login required message
                    <div className="login-required">
                        <div className="login-message">
                            <h4>Login Required</h4>
                            <p>You need to be logged in to track your reading progress and update book status.</p>
                            <div className="login-actions">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="cancel-btn"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthModal(true)
                                    }}
                                    className="submit-btn"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Show the form for logged-in users
                    <form onSubmit={handleSubmit} className="status-form">
                        {/* Reading Status */}
                        <div className="form-group">
                            <label htmlFor="status">Reading Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="undefined">Not Set</option>
                                <option value="plan-to-read">Plan to Read</option>
                                <option value="reading">Currently Reading</option>
                                <option value="read">Finished</option>
                            </select>
                        </div>

                        {/* Progress */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="currentPage">Current Page</label>
                                <input
                                    type="number"
                                    id="currentPage"
                                    name="currentPage"
                                    value={formData.currentPage}
                                    onChange={handleInputChange}
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="totalPages">Total Pages</label>
                                <input
                                    type="number"
                                    id="totalPages"
                                    name="totalPages"
                                    value={formData.totalPages}
                                    onChange={handleInputChange}
                                    min="1"
                                    placeholder={book?.number_of_pages_median || "Total pages"}
                                />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {formData.currentPage && formData.totalPages && (
                            <div className="progress-section">
                                <div className="progress-label">
                                    Progress: {Math.round((formData.currentPage / formData.totalPages) * 100)}%
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min((formData.currentPage / formData.totalPages) * 100, 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="form-group">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Add your thoughts, quotes, or notes about this book..."
                                rows="4"
                            />
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                            <label>Tags</label>
                            <div className="tag-input-section">
                                <div className="tag-input-row">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add a tag..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="add-tag-btn"
                                    >
                                        Add
                                    </button>
                                </div>

                                {formData.tags.length > 0 && (
                                    <div className="tags-list">
                                        {formData.tags.map((tag, index) => (
                                            <span key={index} className="tag-item">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="remove-tag-btn"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cancel-btn"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StatusModal;