import { UserBook, Book } from '../models/models.js';

export const changeStatus = async (req, res) => {
    try {
        const { isbn } = req.params;
        const { userId, status, isFavorite, rating, notes, tags, currentPage, totalPages } = req.body;

        // Validate required fields
        if (!isbn || !status) {
            return res.status(400).json({
                success: false,
                message: 'ISBN and status are required'
            });
        }

        // Validate status value
        const validStatuses = ['read', 'reading', 'plan-to-read', 'undefined'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: read, reading, plan-to-read, undefined'
            });
        }

        // Validate rating if provided
        if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Clean and normalize ISBN
        const normalizedIsbn = isbn.trim()

        // Find book by ISBN
        const book = await Book.findOne({
            $or: [
                { isbn: isbn.trim() },
                { isbn: normalizedIsbn }
            ]
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found with the provided ISBN',
                isbn: isbn
            });
        }

        // Use the found book's ID
        const bookId = book._id;

        // Prepare update data
        const updateData = {
            userId,
            bookId,
            status
        };

        // Add optional fields if provided
        if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
        if (rating !== undefined && rating !== null) updateData.rating = rating;
        if (notes !== undefined) updateData.notes = notes;
        if (tags !== undefined) updateData.tags = tags;

        // Handle progress data
        if (currentPage !== undefined || totalPages !== undefined) {
            updateData.progress = {};
            if (currentPage !== undefined) updateData.progress.currentPage = currentPage;
            if (totalPages !== undefined) updateData.progress.totalPages = totalPages;

            // Calculate percentage if both values are provided
            if (currentPage !== undefined && totalPages !== undefined && totalPages > 0) {
                updateData.progress.percentage = Math.round((currentPage / totalPages) * 100);
            }
        }

        // Handle date updates based on status
        const dateUpdates = {};
        const currentDate = new Date();

        if (status === 'reading') {
            // If changing to reading and no start date exists, set it
            const existingEntry = await UserBook.findOne({ userId, bookId });
            if (!existingEntry || !existingEntry.dates.startedReading) {
                dateUpdates['dates.startedReading'] = currentDate;
            }
        } else if (status === 'read') {
            // If changing to read, set finished date and ensure started date exists
            dateUpdates['dates.finishedReading'] = currentDate;
            const existingEntry = await UserBook.findOne({ userId, bookId });
            if (!existingEntry || !existingEntry.dates.startedReading) {
                dateUpdates['dates.startedReading'] = currentDate;
            }
        }

        // Merge date updates with main update data
        Object.assign(updateData, dateUpdates);

        // Use findOneAndUpdate with upsert to create or update
        const userBook = await UserBook.findOneAndUpdate(
            { userId, bookId },
            {
                $set: updateData,
                $setOnInsert: {
                    'dates.addedToList': currentDate
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        ).populate('bookId', 'title authors coverImage pageCount');

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Book status updated successfully',
            userBook: userBook,
            book: {
                isbn: book.isbn,
                title: book.title,
                authors: book.authors
            }
        });

    } catch (error) {
        console.error('Error updating book status:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Additional helper controller to get user's book status
export const getBookStatus = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.id;

        const userBook = await UserBook.findOne({ userId, bookId })
            .populate('bookId', 'title authors coverImage');

        if (!userBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found in user library'
            });
        }

        res.status(200).json({
            success: true,
            userBook: userBook
        });

    } catch (error) {
        console.error('Error fetching book status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Controller to get all user books
export const getUserBooks = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const { status, limit = 50, page = 1 } = req.query;

        // Build query
        const query = { userId };
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const userBooks = await UserBook.find(query)
            .populate('bookId', 'title authors coverImage publishedDate genres averageRating')
            .sort({ 'dates.addedToList': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UserBook.countDocuments(query);

        res.status(200).json({
            success: true,
            books: userBooks,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                count: userBooks.length,
                totalBooks: total
            }
        });

    } catch (error) {
        console.error('Error fetching user books:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};