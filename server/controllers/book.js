import axios from 'axios';

const OPEN_LIBRARY_URL = 'https://openlibrary.org/search.json';

const fields = [
    'author_key',
    'author_name',
    'first_publish_year',
    'language',
    'number_of_pages_median',
    'title',
    'subject',
    'ratings_average',
    'readinglog_count',
    'isbn',
    'lccn'
].join(',');

export const searchBooks = async (req, res) => {
    try {
        const {
            q = '',
            title = '',
            author = '',
            subject = '',
            isbn = '',
            sort = 'readinglog',
            page = '1',
            limit = '10'
        } = req.query;

        // console.log(req.query)

        if (!q && !title && !author && !subject && !isbn) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const params = {
            q: q,
            fields: fields,
            sort: sort,
            page: page,
            limit: limit
        }

        if (title) {
            params['title'] = title
        }
        if (author) {
            params['author'] = author
        }
        if (subject) {
            params['subject'] = subject
        }
        if (isbn) {
            params['isbn'] = isbn
        }
        if (limit) {
            params['limit'] = limit
        }

        const response = await axios.get(OPEN_LIBRARY_URL, {
            params
        });

        // console.log("Suces")

        const { docs, numFound, start } = response.data;
        // console.log(docs)

        // const imgUrl = await getBookCoverLink(title, author)

        res.status(200).json({
            success: true,
            data: {
                books: docs,
                total: numFound,
                page: start / limit + 1,
                totalPages: Math.ceil(numFound / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching books from OpenLibrary'
        });
    }
};

export const uploadBook = async (req, res) => {
    try {
        const {
            title,
            authors,
            isbn,
            lccn,
            description,
            coverImage,
            publishedDate,
            pageCount,
            language,
            subject,
            averageRating,
            ratingsCount,
            readingLogCount,
            externalIds
        } = req.body;

        // Validate required fields
        if (!title || !authors || !Array.isArray(authors) || authors.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Title and at least one author are required'
            });
        }

        if (!isbn || typeof isbn !== 'string' || isbn.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'ISBN is required and must be a string'
            });
        }

        // Check if book already exists using multiple criteria
        // Priority: ISBN > external IDs > title + authors
        let existingBook = null;

        // First check by ISBN
        existingBook = await Book.findOne({
            isbn: isbn.trim()
        });

        // If not found by ISBN, check by external IDs
        if (!existingBook && externalIds) {
            const externalQueries = [];

            if (externalIds.googleBooks) {
                externalQueries.push({ 'externalIds.googleBooks': externalIds.googleBooks });
            }
            if (externalIds.goodreads) {
                externalQueries.push({ 'externalIds.goodreads': externalIds.goodreads });
            }
            if (externalIds.openLibrary) {
                externalQueries.push({ 'externalIds.openLibrary': externalIds.openLibrary });
            }

            if (externalQueries.length > 0) {
                existingBook = await Book.findOne({
                    $or: externalQueries
                });
            }
        }

        // If still not found, check by title and authors (fuzzy match)
        if (!existingBook) {
            // Normalize title and authors for comparison
            const normalizedTitle = title.toLowerCase().trim();
            const normalizedAuthors = authors.map(author => author.toLowerCase().trim());

            existingBook = await Book.findOne({
                $and: [
                    { title: { $regex: new RegExp(`^${normalizedTitle}$`, 'i') } },
                    { authors: { $in: normalizedAuthors } }
                ]
            });
        }

        // If book already exists, return the existing book
        if (existingBook) {
            return res.status(200).json({
                success: true,
                message: 'Book already exists',
                book: existingBook,
                created: false
            });
        }

        // Prepare book data for creation
        const bookData = {
            title: title.trim(),
            authors: authors.map(author => author.trim()),
            isbn: isbn.trim(),
            description: description || 'Description not available'
        };

        // Add optional fields if provided
        if (lccn && Array.isArray(lccn)) {
            bookData.lccn = lccn.filter(id => id && id.trim());
        }

        if (coverImage) bookData.coverImage = coverImage;

        if (publishedDate) {
            // Handle various date formats
            const parsedDate = new Date(publishedDate);
            if (!isNaN(parsedDate.getTime())) {
                bookData.publishedDate = parsedDate;
            }
        }

        if (pageCount !== undefined && pageCount >= 0) {
            bookData.pageCount = parseInt(pageCount);
        }

        if (language && Array.isArray(language)) {
            bookData.language = language.filter(lang => lang && lang.trim());
        }

        if (subject && Array.isArray(subject)) {
            bookData.subject = subject.filter(subj => subj && subj.trim());
        }

        if (averageRating !== undefined && averageRating >= 0 && averageRating <= 5) {
            bookData.averageRating = parseFloat(averageRating);
        }

        if (ratingsCount !== undefined && ratingsCount >= 0) {
            bookData.ratingsCount = parseInt(ratingsCount);
        }

        if (readingLogCount !== undefined && readingLogCount >= 0) {
            bookData.readingLogCount = parseInt(readingLogCount);
        }

        if (externalIds) {
            bookData.externalIds = {};
            if (externalIds.googleBooks) bookData.externalIds.googleBooks = externalIds.googleBooks;
            if (externalIds.goodreads) bookData.externalIds.goodreads = externalIds.goodreads;
            if (externalIds.openLibrary) bookData.externalIds.openLibrary = externalIds.openLibrary;
        }

        // Create new book
        const newBook = new Book(bookData);
        await newBook.save();

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            book: newBook,
            created: true
        });

    } catch (error) {
        console.error('Error uploading book:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Book with this identifier already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const AUTHOR_SEARCH_URL = 'https://openlibrary.org/search/authors.json';
const AUTHOR_URL = 'https://openlibrary.org/authors';

// Search authors by name
export const searchAuthors = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // console.log(`Searching for author: ${q}`);

        const response = await axios.get(AUTHOR_SEARCH_URL, {
            params: { q }
        });

        // Check if response.data and response.data.docs exist
        if (!response.data || !response.data.docs) {
            return res.status(404).json({
                success: false,
                message: 'No authors found'
            });
        }

        const authorKeys = response.data.docs.map(author => author.key?.replace('/authors/', '')).filter(Boolean);
        // console.log(`Found ${authorKeys.join(',')} authors for query: ${q}`);

        // Fetch detailed information for each author
        const authorDetails = await Promise.all(
            authorKeys.map(async (key) => {
                try {
                    const authorResponse = await axios.get(`${AUTHOR_URL}/${key}.json`);
                    return {
                        key,
                        name: authorResponse.data.name || 'Unknown',
                        birthDate: authorResponse.data.birth_date || null,
                        topWork: authorResponse.data.top_work || null,
                        workCount: authorResponse.data.work_count || 0,
                        alternateNames: authorResponse.data.alternate_names || []
                    };
                } catch (error) {
                    console.error(`Error fetching details for author ${key}:`, error.message);
                    return null;
                }
            })
        );

        // Filter out any failed requests
        const validAuthors = authorDetails.filter(Boolean);

        return res.status(200).json({
            success: true,
            data: {
                authors: validAuthors,
                total: validAuthors.length
            }
        });

    } catch (error) {
        console.error('Error searching authors:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error searching authors from OpenLibrary'
        });
    }
};

// Get author details by key
export const getAuthor = async (req, res) => {
    try {
        const { authorKey } = req.params;

        if (!authorKey || !authorKey.match(/^OL\d+A$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid author key format. Should be like OL123A'
            });
        }

        // console.log(`Fetching author details for: ${authorKey}`);

        const response = await axios.get(`${AUTHOR_URL}/${authorKey}.json`);

        if (!response.data) {
            return res.status(404).json({
                success: false,
                message: 'Author not found'
            });
        }

        const {
            name = 'Unknown',
            birth_date,
            death_date,
            bio,
            wikipedia,
            photos = [],
            personal_name,
            alternate_names = [],
            links = []
        } = response.data;

        return res.status(200).json({
            success: true,
            data: {
                key: authorKey,
                name,
                personalName: personal_name || name,
                alternateNames: alternate_names,
                birthDate: birth_date || null,
                deathDate: death_date || null,
                bio: bio || null,
                wikipedia: wikipedia || null,
                photos,
                links
            }
        });

    } catch (error) {
        console.error('Error fetching author details:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error fetching author details from OpenLibrary'
        });
    }
};