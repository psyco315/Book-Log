import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// assumes: import bcrypt from 'bcrypt'; import jwt from 'jsonwebtoken';
export const signUp = async (req, res, User) => {
    try {
        const {
            username: rawUsername,
            email: rawEmail,
            password,
            displayName: rawDisplayName,
            avatar = null,
            bio = '',
            settings: incomingSettings
        } = req.body || {};

        // basic trimming / normalization
        const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
        const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
        const displayName = typeof rawDisplayName === 'string' ? rawDisplayName.trim() : '';

        // Validate required fields
        if (!username || !email || !password || !displayName) {
            return res.status(400).json({
                success: false,
                message: 'username, email, password and displayName are required'
            });
        }

        // Validate lengths (as per schema)
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({
                success: false,
                message: 'username must be between 3 and 30 characters'
            });
        }
        if (displayName.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'displayName must be at most 100 characters'
            });
        }
        if (typeof bio === 'string' && bio.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'bio must be at most 500 characters'
            });
        }

        // quick email format check
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Check uniqueness (username or email)
        const existingUser = await User.findOne({ $or: [{ email }, { username }] }).lean();
        if (existingUser) {
            if (existingUser.email === email && existingUser.username === username) {
                return res.status(409).json({ success: false, message: 'Username and email already in use' });
            }
            if (existingUser.email === email) {
                return res.status(409).json({ success: false, message: 'Email already in use' });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ success: false, message: 'Username already in use' });
            }
        }

        // Validate/normalize settings (only privacy enums allowed)
        const validPrivacy = ['public', 'private', 'friends'];
        const defaultSettings = {
            privacy: {
                profile: 'public',
                lists: 'public',
                reviews: 'public'
            },
            notifications: {
                email: true,
                push: true
            }
        };

        // shallow-merge incoming settings with defaults, but validate enums
        const settings = { ...defaultSettings };
        if (incomingSettings && typeof incomingSettings === 'object') {
            if (incomingSettings.privacy && typeof incomingSettings.privacy === 'object') {
                settings.privacy.profile = validPrivacy.includes(incomingSettings.privacy.profile)
                    ? incomingSettings.privacy.profile
                    : settings.privacy.profile;
                settings.privacy.lists = validPrivacy.includes(incomingSettings.privacy.lists)
                    ? incomingSettings.privacy.lists
                    : settings.privacy.lists;
                settings.privacy.reviews = validPrivacy.includes(incomingSettings.privacy.reviews)
                    ? incomingSettings.privacy.reviews
                    : settings.privacy.reviews;
            }
            if (incomingSettings.notifications && typeof incomingSettings.notifications === 'object') {
                if (typeof incomingSettings.notifications.email === 'boolean') {
                    settings.notifications.email = incomingSettings.notifications.email;
                }
                if (typeof incomingSettings.notifications.push === 'boolean') {
                    settings.notifications.push = incomingSettings.notifications.push;
                }
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Build user payload for creation
        const createPayload = {
            username,
            email,
            password: hashedPassword, // keep hashed password stored
            displayName,
            avatar,
            bio,
            settings
            // stats will default from schema
        };

        const user = await User.create(createPayload);

        // prepare response user object (do not return password)
        const userResponse = {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            avatar: user.avatar || null,
            bio: user.bio || '',
            settings: user.settings,
            stats: user.stats,
            createdAt: user.createdAt
        };

        // Generate token if possible
        if (process.env.JWT_SECRET) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.status(201).json({ success: true, user: userResponse, token });
        }

        // If no secret, return created user without token but indicate token missing
        console.error('JWT_SECRET is not defined');
        return res.status(201).json({
            success: true,
            user: userResponse,
            message: 'User created successfully but token generation failed'
        });
    } catch (err) {
        console.error('Error creating user:', err);

        // Duplicate key error (index/unique)
        if (err.code === 11000) {
            // get which field caused duplicate
            const dupField = Object.keys(err.keyValue || {})[0] || 'field';
            return res.status(409).json({
                success: false,
                message: `${dupField} already exists`
            });
        }

        // Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message).join(', ');
            return res.status(400).json({ success: false, message: messages });
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating user'
        });
    }
};


export const signIn = async (req, res, User) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check for JWT_SECRET before creating token
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('Error signing in user:', error);
        res.status(500).json({
            success: false,
            message: 'Error signing in user'
        });
    }
};

export const refreshToken = async (req, res, User) => {
    try {
        const { userId } = req.user; // From verifyToken middleware

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({
            success: false,
            message: 'Error refreshing token'
        });
    }
};