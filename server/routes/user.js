import express from 'express';
import User from '../models/user.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();

import {
    createUser,
    getUser,
    editUser,
    changePassword,
    deleteUser
} from '../controllers/user.js';

// Public routes
router.route('/')
    .post((req, res) => createUser(req, res, User));

// Protected routes
router.route('/:userId')
    .get(verifyToken, (req, res) => getUser(req, res, User))
    .put(verifyToken, (req, res) => editUser(req, res, User))
    .delete(verifyToken, (req, res) => deleteUser(req, res, User));

router.route('/:userId/password')
    .put(verifyToken, (req, res) => changePassword(req, res, User));

export default router;