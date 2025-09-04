import { Review } from '../models/models.js';
import mongoose from 'mongoose';

// Helper function to validate review data
const validateReviewData = (data) => {
  const { rating, content, title } = data;
  
    // console.log({ title, content, rating })
  
  // Must have either rating or content (or both)
  if (!rating && !content) {
    return { isValid: false, error: 'Either rating or written review is required' };
  }
  
  // If written review exists, title is required
  if (content && !title) {
    return { isValid: false, error: 'Title is required when providing a written review' };
  }
  
  // Validate rating range
  if (rating && (rating < .5 || rating > 5)) {
    return { isValid: false, error: 'Rating must be between 1 and 5 yawrrr' };
  }
  
  return { isValid: true };
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { bookId, userBookId, title, content, rating } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    // Validate review data
    const validation = validateReviewData({ rating, content, title });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({ userId, bookId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Create review object
    const reviewData = {
      userId,
      bookId,
      userBookId: userBookId || null
    };

    // Add optional fields if provided
    if (rating) reviewData.rating = rating;
    if (content) reviewData.content = content;
    if (title) reviewData.title = title;

    const review = new Review(reviewData);
    const savedReview = await review.save();

    // Populate user and book details
    const populatedReview = await Review.findById(savedReview._id)
      .populate('userId', 'username email')
      .populate('bookId', 'title author');

    res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.bookId) filter.bookId = req.query.bookId;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.rating) filter.rating = req.query.rating;

    // Build sort object
    let sort = { createdAt: -1 }; // Default sort
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [sortField]: sortOrder };
    }

    const reviews = await Review.find(filter)
      .populate('userId', 'username email')
      .populate('bookId', 'title author')
      .populate('userBookId', 'status readingProgress')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(id)
      .populate('userId', 'username email')
      .populate('bookId', 'title author')
      .populate('userBookId', 'status readingProgress');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ review });

  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  // console.log("halor")

  try {
    const { id } = req.params;
    const { title, content, rating } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Validate review data
    const validation = validateReviewData({ rating, content, title });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    // Store current content in edit history if content is being changed
    if (content && content !== review.content) {
      review.editHistory.push({
        content: review.content,
        editedAt: new Date()
      });
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (rating !== undefined) updateData.rating = rating;

    // If removing content, also remove title
    if (content === '' || content === null) {
      updateData.title = '';
      updateData.content = '';
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { ...updateData, editHistory: review.editHistory },
      { new: true, runValidators: true }
    )
      .populate('userId', 'username email')
      .populate('bookId', 'title author');

    res.status(200).json({
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews by book ID
// @route   GET /api/reviews/book/:bookId
// @access  Public
export const getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sortBy === 'rating') {
      sort = { rating: req.query.sortOrder === 'asc' ? 1 : -1 };
    }

    const reviews = await Review.find({ bookId })
      .populate('userId', 'username email')
      .populate('userBookId', 'status readingProgress')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ bookId });

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId), rating: { $exists: true } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    res.status(200).json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      ratingStats: ratingStats[0] || { averageRating: 0, totalRatings: 0 }
    });

  } catch (error) {
    console.error('Get reviews by book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews by user ID
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const reviews = await Review.find({ userId })
      .populate('bookId', 'title author')
      .populate('userBookId', 'status readingProgress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ userId });

    res.status(200).json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get reviews by user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};