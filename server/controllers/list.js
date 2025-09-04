// list.js (ES6 module)
import {Book, List} from '../models/models.js';
import mongoose from 'mongoose';

/**
 * Helper function to calculate metadata
 */
const calculateMetadata = async (books) => {
    if (!books || books.length === 0) {
        return {
            totalBooks: 0,
            averageRating: 0,
            genres: []
        };
    }

    const bookIds = books.map(b => b.bookId);
    const booksData = await Book.find({ _id: { $in: bookIds } }).select('ratings_average subject');

    const totalBooks = books.length;
    const ratings = booksData.filter(b => b.ratings_average).map(b => b.ratings_average);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    const allGenres = booksData.flatMap(b => b.subject || []);
    const uniqueGenres = [...new Set(allGenres)];

    return {
        totalBooks,
        averageRating: Math.round(averageRating * 10) / 10,
        genres: uniqueGenres
    };
};

/* -------------------------
   CREATE - Create a new list
   ------------------------- */
export const createList = async (req, res) => {
    try {
        const { title, description, visibility = 'public', books = [] } = req.body;
        const userId = req.user?.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'List title is required'
            });
        }

        // Validate books if provided
        if (books.length > 0) {
            const bookIds = books.map(b => b.bookId);
            const existingBooks = await Book.find({ _id: { $in: bookIds } });

            if (existingBooks.length !== bookIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more books not found'
                });
            }
        }

        // Calculate metadata
        const metadata = await calculateMetadata(books);

        const newList = new List({
            userId,
            title: title.trim(),
            description: description?.trim() || '',
            visibility,
            books: books.map((book, index) => ({
                bookId: book.bookId,
                addedAt: book.addedAt || new Date(),
                order: book.order || index
            })),
            metadata
        });

        const savedList = await newList.save();
        await savedList.populate('books.bookId', 'title author_name coverImage isbn');

        res.status(201).json({
            success: true,
            message: 'List created successfully',
            list: savedList
        });

    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   READ - Get all lists
   ------------------------- */
export const getLists = async (req, res) => {
    try {
        const {
            userId,
            visibility,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const currentUserId = req.user?.id || req.user?._id;

        // Build filter object
        const filter = {};

        if (userId) {
            filter.userId = userId;
        }

        if (visibility) {
            filter.visibility = visibility;
        } else {
            // If no specific visibility requested, show public lists and user's own lists
            if (currentUserId) {
                filter.$or = [
                    { visibility: 'public' },
                    { userId: currentUserId }
                ];
            } else {
                filter.visibility = 'public';
            }
        }

        // Calculate pagination
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const lists = await List.find(filter)
            .populate('userId', 'username profilePicture')
            .populate('books.bookId', 'title author_name coverImage isbn ratings_average')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit, 10));

        const total = await List.countDocuments(filter);

        res.status(200).json({
            success: true,
            lists,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                pages: Math.ceil(total / parseInt(limit, 10))
            }
        });
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   READ - Get a single list
   ------------------------- */
export const getListById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid list ID'
            });
        }

        const list = await List.findById(id)
            .populate('userId', 'username profilePicture')
            .populate('books.bookId', 'title author_name coverImage isbn ratings_average subject');

        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'List not found'
            });
        }

        // Check if user can access this list
        if (list.visibility === 'private' && list.userId._id.toString() !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            list
        });
    } catch (error) {
        console.error('Error fetching list:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   UPDATE - Update list details
   ------------------------- */
export const updateList = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, visibility } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid list ID'
            });
        }

        const list = await List.findById(id);

        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'List not found'
            });
        }

        // Check if user owns this list
        if (list.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own lists.'
            });
        }

        // Update fields
        const updateData = {};
        if (title && title.trim()) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (visibility && ['public', 'private', 'friends'].includes(visibility)) {
            updateData.visibility = visibility;
        }

        const updatedList = await List.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('books.bookId', 'title author_name coverImage isbn');

        res.status(200).json({
            success: true,
            message: 'List updated successfully',
            list: updatedList
        });
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   UPDATE - Add book to list
   ------------------------- */
export const addBookToList = async (req, res) => {
    try {
        const { id } = req.params;
        const { bookId, order } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid list ID or book ID'
            });
        }

        const list = await List.findById(id);

        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'List not found'
            });
        }

        // Check if user owns this list
        if (list.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only modify your own lists.'
            });
        }

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check if book is already in the list
        const bookExists = list.books.some(b => b.bookId.toString() === bookId);
        if (bookExists) {
            return res.status(400).json({
                success: false,
                message: 'Book is already in this list'
            });
        }

        // Add book to list
        list.books.push({
            bookId,
            addedAt: new Date(),
            order: order || list.books.length
        });

        // Recalculate metadata
        list.metadata = await calculateMetadata(list.books);

        await list.save();
        await list.populate('books.bookId', 'title author_name coverImage isbn ratings_average');

        res.status(200).json({
            success: true,
            message: 'Book added to list successfully',
            list
        });
    } catch (error) {
        console.error('Error adding book to list:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   UPDATE - Remove book from list
   ------------------------- */
export const removeBookFromList = async (req, res) => {
    try {
        const { id, bookId } = req.params;
        const userId = req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid list ID or book ID'
            });
        }

        const list = await List.findById(id);

        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'List not found'
            });
        }

        // Check if user owns this list
        if (list.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only modify your own lists.'
            });
        }

        // Remove book from list
        const bookIndex = list.books.findIndex(b => b.bookId.toString() === bookId);
        if (bookIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Book not found in this list'
            });
        }

        list.books.splice(bookIndex, 1);

        // Recalculate metadata
        list.metadata = await calculateMetadata(list.books);

        await list.save();
        await list.populate('books.bookId', 'title author_name coverImage isbn ratings_average');

        res.status(200).json({
            success: true,
            message: 'Book removed from list successfully',
            list
        });
    } catch (error) {
        console.error('Error removing book from list:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   UPDATE - Reorder books in list
   ------------------------- */
export const reorderBooksInList = async (req, res) => {
    try {
        const { id } = req.params;
        const { bookOrders } = req.body; // Array of { bookId, order }
        const userId = req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid list ID'
            });
        }

        if (!Array.isArray(bookOrders)) {
            return res.status(400).json({
                success: false,
                message: 'bookOrders must be an array'
            });
        }

        const list = await List.findById(id);

        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'List not found'
            });
        }

        // Check if user owns this list
        if (list.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only modify your own lists.'
            });
        }

        // Update order for each book
        bookOrders.forEach(({ bookId, order }) => {
            const bookIndex = list.books.findIndex(b => b.bookId.toString() === bookId);
            if (bookIndex !== -1) {
                list.books[bookIndex].order = order;
            }
        });

        // Sort books by order
        list.books.sort((a, b) => a.order - b.order);

        await list.save();
        await list.populate('books.bookId', 'title author_name coverImage isbn ratings_average');

        res.status(200).json({
            success: true,
            message: 'Books reordered successfully',
            list
        });
    } catch (error) {
        console.error('Error reordering books:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   UPDATE - Toggle like on list
   ------------------------- */
export const toggleListLike = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'like' or 'unlike'
        const userId = req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid list ID'
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        const list = await List.findById(id);

        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'List not found'
            });
        }

        // Can't like your own list
        if (list.userId.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot like your own list'
            });
        }

        // Update likes count
        if (action === 'like') {
            list.likes = (list.likes || 0) + 1;
        } else if (action === 'unlike') {
            list.likes = Math.max((list.likes || 0) - 1, 0);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Action must be "like" or "unlike"'
            });
        }

        await list.save();

        res.status(200).json({
            success: true,
            message: `List ${action}d successfully`,
            likes: list.likes
        });
    } catch (error) {
        console.error('Error toggling list like:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   READ - Get user's lists
   ------------------------- */
export const getUserLists = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id || req.user?._id;
        const { visibility, page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // Build filter
        const filter = { userId };

        // If viewing someone else's lists, only show public ones unless specified
        if (userId !== currentUserId) {
            if (visibility) {
                filter.visibility = visibility;
            } else {
                filter.visibility = 'public';
            }
        } else if (visibility) {
            filter.visibility = visibility;
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const lists = await List.find(filter)
            .populate('books.bookId', 'title author_name coverImage isbn ratings_average')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit, 10));

        const total = await List.countDocuments(filter);

        res.status(200).json({
            success: true,
            lists,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                pages: Math.ceil(total / parseInt(limit, 10))
            }
        });
    } catch (error) {
        console.error('Error fetching user lists:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   DELETE - Delete a list
   ------------------------- */
export const deleteList = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid list ID'
            });
        }

        const list = await List.findById(id);

        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'List not found'
            });
        }

        // Check if user owns this list
        if (list.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own lists.'
            });
        }

        await List.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'List deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   READ - Search lists
   ------------------------- */
export const searchLists = async (req, res) => {
    try {
        const { q, visibility = 'public', page = 1, limit = 10 } = req.query;
        const currentUserId = req.user?.id || req.user?._id;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Build filter
        const filter = {
            $or: [
                { title: { $regex: q.trim(), $options: 'i' } },
                { description: { $regex: q.trim(), $options: 'i' } }
            ]
        };

        // Apply visibility filter
        if (currentUserId) {
            filter.$and = [
                {
                    $or: [
                        { visibility: 'public' },
                        { userId: currentUserId }
                    ]
                }
            ];
        } else {
            filter.visibility = 'public';
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const lists = await List.find(filter)
            .populate('userId', 'username profilePicture')
            .populate('books.bookId', 'title author_name coverImage isbn')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit, 10));

        const total = await List.countDocuments(filter);

        res.status(200).json({
            success: true,
            lists,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                pages: Math.ceil(total / parseInt(limit, 10))
            }
        });
    } catch (error) {
        console.error('Error searching lists:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/* -------------------------
   Exports
   ------------------------- */
export default {
    createList,
    getLists,
    getListById,
    getUserLists,
    updateList,
    addBookToList,
    removeBookFromList,
    reorderBooksInList,
    toggleListLike,
    deleteList,
    searchLists
};
