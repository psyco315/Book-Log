import express from 'express';
import { Review } from '../models/models.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();

import {
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByBook,
    getReviewsByUser
} from '../controllers/review.js';

// Public routes
router.route('/')
    .get((req, res) => getAllReviews(req, res))
    .post(verifyToken, (req, res) => createReview(req, res));

// Public routes for getting reviews by book or user
router.route('/book/:bookId')
    .get((req, res) => getReviewsByBook(req, res));

router.route('/user/:userId')
    .get((req, res) => getReviewsByUser(req, res));

// Protected routes for individual reviews
router.route('/:id')
    .get((req, res) => getReviewById(req, res))
    .put(verifyToken, (req, res) => updateReview(req, res))
    .delete(verifyToken, (req, res) => deleteReview(req, res));

export default router;