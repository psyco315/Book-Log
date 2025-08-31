import express from 'express';
import { searchBooks, uploadBook, getBook, getAuthor, searchAuthors } from '../controllers/book.js';
import { Book } from '../models/models.js';
// import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.route('/search')
    .get(searchBooks);

router.route('/db')
    .post((req, res) => uploadBook(req, res, Book));

router.route('/db/:isbn')
    .get((req, res) => getBook(req, res, Book));

router.route('/author/search')
    .get(searchAuthors);
    
router.route('/author/search/:authorKey')
    .get(getAuthor);

export default router;