// bookHelper.js
import { fetchBooks, getDesc } from '../getData';
import { imgFunc1, imgFunc2, imgFunc3 } from '../getData';
import { publicApi, securedApi } from '../api';

/** --- Review Helpers --- */

/**
 * Fetch existing review and set states.
 */
export const fetchExistingReview = async (bookId, currUser, loggedIn, setExistingReview, setUserRating) => {
    if (!loggedIn || !currUser || !bookId) {
        if (setExistingReview) setExistingReview(null);
        if (setUserRating) setUserRating(0);
        return null;
    }

    try {
        const response = await securedApi.get(`/api/review?bookId=${bookId}&userId=${currUser._id}`);
        if (response.data.reviews && response.data.reviews.length > 0) {
            const review = response.data.reviews[0];
            if (setExistingReview) setExistingReview(review);
            if (setUserRating) setUserRating(review.rating || 0);
            return review;
        } else {
            if (setExistingReview) setExistingReview(null);
            if (setUserRating) setUserRating(0);
            return null;
        }
    } catch (error) {
        console.error('Error fetching existing review:', error);
        if (setExistingReview) setExistingReview(null);
        if (setUserRating) setUserRating(0);
        return null;
    }
};

/**
 * Submit or update rating only. Handles setting submitting state and updating stored review & rating.
 */
export const submitRating = async (
    newRating,
    existingReview,
    currBook,
    currUser,
    setExistingReview,
    setUserRating,
    setIsRatingSubmitting
) => {
    if (setIsRatingSubmitting) setIsRatingSubmitting(true);

    try {
        if (!currUser || !currBook) throw new Error('Missing user or book');

        if (existingReview) {
            const response = await securedApi.put(`/api/review/${existingReview._id}`, {
                rating: newRating,
                title: existingReview.title || '',
                content: existingReview.content || ''
            });

            if (response.data.review) {
                if (setExistingReview) setExistingReview(response.data.review);
                if (setUserRating) setUserRating(response.data.review.rating || 0);
                return response.data.review;
            }
        } else {
            const reviewData = { bookId: currBook, rating: newRating };
            const response = await securedApi.post('/api/review', reviewData);

            if (response.data.review) {
                if (setExistingReview) setExistingReview(response.data.review);
                if (setUserRating) setUserRating(response.data.review.rating || newRating);
                return response.data.review;
            }
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        // Revert rating if provided
        if (setUserRating && existingReview) setUserRating(existingReview.rating || 0);
        if (setUserRating && !existingReview) setUserRating(0);
        throw error;
    } finally {
        if (setIsRatingSubmitting) setIsRatingSubmitting(false);
    }
};

/**
 * Submit or update full review (title/content + rating). Updates state via setter.
 */
export const submitReview = async (
    reviewData,
    existingReview,
    currBook,
    userRating,
    setExistingReview
) => {
    try {
        if (!currBook) throw new Error('Missing book id');

        if (existingReview) {
            const response = await securedApi.put(`/api/review/${existingReview._id}`, {
                ...reviewData,
                rating: userRating || reviewData.rating || existingReview.rating
            });

            if (response.data.review) {
                if (setExistingReview) setExistingReview(response.data.review);
                return response.data;
            }
        } else {
            const fullReviewData = {
                ...reviewData,
                bookId: currBook,
                rating: userRating || reviewData.rating
            };
            const response = await securedApi.post('/api/review', fullReviewData);

            if (response.data.review) {
                if (setExistingReview) setExistingReview(response.data.review);
                return response.data;
            }
        }
        return null;
    } catch (error) {
        console.error('Failed to submit review:', error);
        throw error;
    }
};

/** --- Book Data Helpers --- */

export const cleanSubjects = (subjects) => {
    if (!Array.isArray(subjects)) return [];

    const result = subjects
        .flatMap(item => item.split(","))
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .filter((s, i, arr) => arr.indexOf(s) === i);

    return result;
};

/**
 * Loads book and description, then sets book state using setBook.
 */
export const loadBookAndDescription = async (isbn, setBook) => {
    if (!isbn) return null;

    try {
        const bookData = await fetchBooks({ isbn });
        if (bookData?.data) {
            const finalData = bookData.data.books[0];
            finalData.subject = cleanSubjects(finalData.subject);
            finalData.description = '';

            if (finalData.ratings_average) {
                finalData.ratings_average = parseFloat(finalData.ratings_average).toFixed(1);
            }

            try {
                const descData = await getDesc(finalData.title, finalData.author_name);
                if (descData) {
                    finalData.description = typeof descData.description === "string"
                        ? descData.description
                        : descData.description?.value || "No description available";
                }
            } catch (err) {
                console.error("Failed to fetch description:", err);
            }

            if (setBook) setBook(finalData);
            return finalData;
        }
        return null;
    } catch (err) {
        console.error("Failed to fetch book:", err);
        if (setBook) setBook(null);
        return null;
    }
};

/**
 * Load cover URL using fallback functions. Sets img link and loading state.
 */
export const loadCover = async (book, setImgLink, setIsLoading) => {
    if (setIsLoading) setIsLoading(true);

    try {
        let coverUrl = null;
        if (book) {
            coverUrl = await imgFunc1(book.title, book.author_name);
            if (!coverUrl) coverUrl = await imgFunc2(book.lccn, book.title);
            if (!coverUrl) coverUrl = await imgFunc3(book.isbn, book.title);
        }

        if (coverUrl) {
            if (setImgLink) setImgLink(coverUrl);
            return coverUrl;
        }

        return null;
    } catch (error) {
        console.error('Error loading cover:', error);
        return null;
    } finally {
        if (setIsLoading) setIsLoading(false);
    }
};

/**
 * Add book to DB and set currBook id state.
 */
export const addBookToDb = async (bookData, setCurrBook) => {
    try {
        const response = await publicApi.post('/api/book/db', bookData);
        if (response?.data?.book?._id) {
            if (setCurrBook) setCurrBook(response.data.book._id);
        }
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

/**
 * Fetch book status and set state via setter.
 */
export const fetchBookStatus = async (bookId, setCurrBookStatus) => {
    try {
        const response = await securedApi.get(`/api/userdata/${bookId}/status`);
        if (response.data.success) {
            if (setCurrBookStatus) setCurrBookStatus(response.data.userBook);
            return response.data.userBook;
        } else {
            if (setCurrBookStatus) setCurrBookStatus(null);
            return null;
        }
    } catch (error) {
        console.error('Error fetching book status:', error);
        if (setCurrBookStatus) setCurrBookStatus(null);
        return null;
    }
};

/**
 * Create sanitized book object for DB upload.
 */
export const createBookData = (book, imgLink) => {
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

    // Clean up null/undefined/empty arrays
    Object.keys(bookData).forEach(key => {
        if (bookData[key] === null || bookData[key] === undefined ||
            (Array.isArray(bookData[key]) && bookData[key].length === 0)) {
            delete bookData[key];
        }
    });

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

/** --- Status Update --- */

/**
 * Update user-book status on server and set local state via setter.
 */
export const handleStatusUpdate = async (statusData, isbn, setCurrBookStatus) => {
    try {
        const response = await securedApi.post(`/api/userdata/${isbn}/status`, statusData);
        if (response.data.success) {
            if (setCurrBookStatus) setCurrBookStatus(response.data.userBook);
            return response.data.userBook;
        } else {
            throw new Error(response.data.message || 'Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
};
