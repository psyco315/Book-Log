import mongoose from 'mongoose';
const { Schema } = mongoose;

// --- Users Schema (keep unique:true on fields, remove schema.index duplicates) ---
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,     // keep this
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,     // keep this
    lowercase: true
  },
  password: {
    type: String,
    required: false,     // keep false to allow OAuth-only users; enforce at controller/signup
    select: false,       // never returned by default from queries
    minlength: 8,        // enforce strong-ish passwords at the controller as well
    maxlength: 200
  },
  displayName: { type: String, required: true, trim: true, maxlength: 100 },
  avatar: { type: String, default: null },
  bio: { type: String, maxlength: 500, default: '' },
  settings: { /* ... */ },
  stats: { /* ... */ }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ---- REMOVE these lines (they caused duplicate index warnings) ----
// userSchema.index({ username: 1 });
// userSchema.index({ email: 1 });

// --- Books Schema: remove field-level sparse and rely on schema.index(...) ---
const bookSchema = new Schema({
  title: { type: String, required: true, trim: true },
  authors: [{ type: String, required: true }],
  isbn: { type: String, required: true, trim: true },
  lccn: {
    type: [String],
    default: []
  },
  description: { type: String, default: 'Description not available' },
  coverImage: { type: String, default: null },
  publishedDate: { type: Number, default: null },
  pageCount: { type: Number, min: 0, default: 0 },
  lang: {
    type: [String],
    default: []
  },
  subject: [String],
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
  readingLogCount: { type: Number, min: 0, default: 0 },
  externalIds: {
    googleBooks: { type: String, default: null },
    goodreads: { type: String, default: null },
    openLibrary: { type: String, default: null }
  }
}, { timestamps: true });

// keep these index declarations (they're explicit, and we removed the field-level duplicates)
bookSchema.index({ title: 'text', authors: 'text' });
bookSchema.index({ isbn: 1 }, { sparse: true });
bookSchema.index({ subject: 1 });

// User Book Status Schema - Individual Document Approach (Recommended)
const userBookSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  status: {
    type: String,
    enum: ['read', 'reading', 'plan-to-read', 'undefined'],
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  progress: {
    currentPage: {
      type: Number,
      min: 0,
      default: 0
    },
    totalPages: {
      type: Number,
      min: 0,
      default: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  dates: {
    startedReading: { type: Date, default: null },
    finishedReading: { type: Date, default: null },
    addedToList: { type: Date, default: Date.now }
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  tags: [String]
}, {
  timestamps: true
});

// Compound indexes
userBookSchema.index({ userId: 1, bookId: 1 }, { unique: true });
userBookSchema.index({ userId: 1, status: 1 });
userBookSchema.index({ userId: 1, isFavorite: 1 });
userBookSchema.index({ bookId: 1, status: 1 });

// Virtual for progress percentage
userBookSchema.virtual('progressPercentage').get(function () {
  if (this.progress.totalPages > 0) {
    return Math.round((this.progress.currentPage / this.progress.totalPages) * 100);
  }
  return 0;
});

// Pre-save middleware to update progress percentage
userBookSchema.pre('save', function (next) {
  if (this.progress.totalPages > 0) {
    this.progress.percentage = Math.round(
      (this.progress.currentPage / this.progress.totalPages) * 100
    );
  }
  next();
});

// Reviews Schema
const reviewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userBookId: {
    type: Schema.Types.ObjectId,
    ref: 'UserBook',
    default: null
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    maxlength: 5000,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  editHistory: [{
    content: String,
    editedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ bookId: 1, visibility: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

// Lists Schema
const listSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  tags: [String],
  books: [{
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      maxlength: 500,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  followers: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  metadata: {
    totalBooks: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    genres: [String]
  }
}, {
  timestamps: true
});

// Indexes
listSchema.index({ userId: 1, type: 1 });
listSchema.index({ visibility: 1, createdAt: -1 });
listSchema.index({ 'books.bookId': 1 });

// Activities Schema
const activitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['review', 'status_change', 'list_create', 'book_add', 'rating', 'favorite'],
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  data: {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book' },
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
    listId: { type: Schema.Types.ObjectId, ref: 'List' },
    oldValue: String,
    newValue: String,
    customData: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1, visibility: 1 });
// TTL index to auto-delete old activities after 6 months
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

// Follow Schema
const followSchema = new Schema({
  followerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followingId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Comments Schema
const commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['review', 'list'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ targetId: 1, targetType: 1, createdAt: -1 });

// Likes Schema
const likeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['review', 'list', 'comment'],
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index
likeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

// Reading Sessions Schema
const readingSessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userBookId: {
    type: Schema.Types.ObjectId,
    ref: 'UserBook',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  pagesRead: {
    type: Number,
    min: 0,
    default: 0
  },
  startPage: {
    type: Number,
    min: 0,
    default: 0
  },
  endPage: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
readingSessionSchema.index({ userId: 1, bookId: 1, createdAt: -1 });

// Notifications Schema
const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'recommendation'],
    required: true
  },
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  data: {
    targetId: Schema.Types.ObjectId,
    targetType: String,
    message: String
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
// TTL index to auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// ALTERNATIVE: Status-Based Schema (if you prefer your approach)
const userStatusSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  finished: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],
  reading: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],
  planToRead: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }]
}, {
  timestamps: true
});

// For status-based approach, you'd need this for metadata
const userBookMetadataSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  progress: {
    currentPage: { type: Number, min: 0, default: 0 },
    totalPages: { type: Number, min: 0, default: 0 }
  },
  dates: {
    startedReading: { type: Date, default: null },
    finishedReading: { type: Date, default: null },
    addedAt: { type: Date, default: Date.now }
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  tags: [String]
}, {
  timestamps: true
});

userBookMetadataSchema.index({ userId: 1, bookId: 1 }, { unique: true });

// ---- Model creation: use guarded pattern for all models ----
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
const UserBook = mongoose.models.UserBook || mongoose.model('UserBook', userBookSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const List = mongoose.models.List || mongoose.model('List', listSchema);
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
const Follow = mongoose.models.Follow || mongoose.model('Follow', followSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);
const ReadingSession = mongoose.models.ReadingSession || mongoose.model('ReadingSession', readingSessionSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

const UserStatus = mongoose.models.UserStatus || mongoose.model('UserStatus', userStatusSchema);
const UserBookMetadata = mongoose.models.UserBookMetadata || mongoose.model('UserBookMetadata', userBookMetadataSchema);

export {
  User, Book, UserBook, Review, List, Activity, Follow, Comment, Like,
  ReadingSession, Notification, UserStatus, UserBookMetadata
};