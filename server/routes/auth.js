import express from 'express';
import { User } from '../models/models.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();

import {
    signUp,
    signIn,
    refreshToken
} from '../controllers/auth.js';

// Public routes
router.route('/signup')
    .post((req, res) => signUp(req, res, User));

router.route('/signin')
    .post((req, res) => signIn(req, res, User));

// Protected routes
router.route('/refresh')
    .post(verifyToken, (req, res) => refreshToken(req, res, User));

export default router;