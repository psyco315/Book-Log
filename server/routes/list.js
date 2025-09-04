import express from 'express';
import {
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
} from '../controllers/list.js'; // Adjust path to your controller
import { verifyToken } from '../middleware/auth.js'; // Adjust path to your auth middleware

const router = express.Router();

// Public routes (no authentication required)
router.get('/search', searchLists);           // GET /api/lists/search?q=query
router.get('/public', getLists);              // GET /api/lists/public
router.get('/:id', getListById);              // GET /api/lists/:id

// Protected routes (authentication required)
router.use(verifyToken); // Apply authentication middleware to all routes below

// List CRUD operations
router.post('/', createList);                 // POST /api/lists - Create new list
router.get('/', getLists);                    // GET /api/lists - Get all accessible lists
router.put('/:id', updateList);               // PUT /api/lists/:id - Update list details
router.delete('/:id', deleteList);            // DELETE /api/lists/:id - Delete list

// Book operations within lists
router.post('/:id/books', addBookToList);     // POST /api/lists/:id/books - Add book to list
router.delete('/:id/books/:bookId', removeBookFromList); // DELETE /api/lists/:id/books/:bookId
router.put('/:id/reorder', reorderBooksInList); // PUT /api/lists/:id/reorder - Reorder books

// Social features
router.post('/:id/like', toggleListLike);     // POST /api/lists/:id/like - Toggle like/unlike

// User-specific routes
router.get('/user/:userId', getUserLists);    // GET /api/lists/user/:userId - Get user's lists

export default router;