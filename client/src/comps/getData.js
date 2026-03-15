import { publicApi } from './api';
import axios from 'axios'

export const fetchBooks = async ({ q = "", author = "", title = "", subject = "", isbn = "", limit = 12, page}) => {
    // ✅ Check if all params are empty
    if (![q, author, title, subject, isbn].some(param => param && param.trim() !== "")) {
        throw new Error("At least one of q, author, title, isbn or subject must be provided.");
    }

    try {
        const params = new URLSearchParams({
            q,
            author,
            title,
            subject,
            isbn,
            limit,
            page,
            sort: "readinglog"
        });

        const url = `/api/book/search?${params.toString()}`;

        const { data } = await publicApi.get(url);

        return data;
    } catch (err) {
        console.error(`Error fetching "${title}":`, err.message);
        return null; // or []
    }
};

export const getDesc = async (query, author) => {
    try {
        // Construct the API URL with query parameters
        const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
        const searchQuery = `q=${encodeURIComponent(query)}+inauthor:${encodeURIComponent(author)}`;
        const apiUrl = `${baseUrl}?${searchQuery}`;

        // Fetch data from Google Books API
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if any books were found
        if (!data.items || data.items.length === 0) {
            return 'No books found for the given query.';
        }

        // Extract description from the first result
        const firstBook = data.items[0];
        const volumeInfo = firstBook.volumeInfo;

        // Return the description if available
        if (volumeInfo.description) {
            return {
                description: volumeInfo.description
            };
        } else {
            return 'Description not available for this book.';
        }

    } catch (error) {
        console.error('Error fetching book data:', error);
        return `Error: ${error.message}`;
    }
}


