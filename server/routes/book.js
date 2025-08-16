import express from 'express';
import { searchBooks, getAuthor, searchAuthors } from '../controllers/book.js';
// import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.route('/search')
    .get(searchBooks);

router.route('/author/search')
    .get(searchAuthors);
    
router.route('/author/search/:authorKey')
    .get(getAuthor);

export default router;