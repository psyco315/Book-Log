import { fetchBooks, getDesc } from '../getData';
import { imgFunc1, imgFunc2, imgFunc3 } from '../getData';
import { publicApi, securedApi } from '../api';
import axios from 'axios';

const handleSubmitReview = async (reviewData) => {
    try {
        // Call your review API endpoint
        const response = await securedApi.post('/api/reviews', reviewData);
        console.log('Review submitted successfully:', response.data);
        // You can add success notification here
        return response.data;
    } catch (error) {
        console.error('Failed to submit review:', error);
        throw error;
    }
};

const handleRatingChange = (newRating, setUserRating) => {
    setUserRating(newRating);
    console.log('User rated:', newRating);
    // Call your review API here
};


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

export { handleSubmitReview, handleRatingChange, handleStatusUpdate, createBookData, fetchBookStatus, cleanSubjects, loadBookAndDescription, loadCover, addBookToDb }