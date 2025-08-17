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
    'person',
    'ratings_average',
    'readinglog_count',
    'subject_key',
    'lccn'
].join(',');

export const searchBooks = async (req, res) => {
    try {
        const {
            query = '',
            sort = 'readinglog',
            page = '1',
            limit = '10'
        } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const response = await axios.get(OPEN_LIBRARY_URL, {
            params: {
                q: query,
                fields,
                sort: sort,
                page: page,
                limit: limit
            }
        });

        const { docs, numFound, start } = response.data;

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
        console.error('Error fetching books:');
        res.status(500).json({
            success: false,
            message: 'Error fetching books from OpenLibrary'
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

        console.log(`Searching for author: ${q}`);
        
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
        console.log(`Found ${authorKeys.join(',')} authors for query: ${q}`);

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

        console.log(`Fetching author details for: ${authorKey}`);

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