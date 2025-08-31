import express from 'express';
import { changeStatus, getBookStatus, getUserBooks } from '../controllers/userData.js';
import { verifyToken } from '../middleware/auth.js'; // Your auth middleware

const router = express.Router();

// Change/update book status for authenticated user
// POST/PUT /api/books/:bookId/status
router.put('/:isbn/status', verifyToken, changeStatus);
router.post('/:isbn/status', verifyToken, changeStatus);

// Get specific book status for authenticated user  
// GET /api/books/:bookId/status
router.get('/:isbn/status', verifyToken, getBookStatus);

// Get all books for a user
// GET /api/user/:userId/books
router.get('/user/:isbn/books', verifyToken, getUserBooks);

// Get all books for authenticated user
// GET /api/user/books
router.get('/user/books', verifyToken, getUserBooks);

export default router;