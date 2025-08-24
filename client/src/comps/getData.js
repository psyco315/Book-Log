import axios from 'axios'

export const fetchBooks = async ({ q = "", author = "", title = "", subject = "" }) => {
    // ✅ Check if all params are empty
    if (![q, author, title, subject].some(param => param && param.trim() !== "")) {
        throw new Error("At least one of q, author, title, or subject must be provided.");
    }

    try {
        const params = new URLSearchParams({
            q,
            author,
            title,
            subject,
            sort: "currently_reading"
        });

        const url = `http://localhost:3000/api/book/search?${params.toString()}`;

        const { data } = await axios.get(url);
        return data;
    } catch (err) {
        console.error(`Error fetching "${title}":`, err.message);
        return null; // or []
    }
};


export const imgFunc1 = async (title, author) => {
    if (!title) {
        throw new Error("Title is required");
    }
    if (!author) {
        throw new Error("Author is required");
    }

    // Normalize author if it's an array
    let authorStr = Array.isArray(author) ? author[0] : author;

    // Remove dots and trim
    const cleanTitle = String(title).replace(/\./g, "").trim();
    const cleanAuthor = String(authorStr).replace(/\./g, "").trim();

    // Encode safely
    const encodedTitle = encodeURIComponent(cleanTitle);
    const encodedAuthor = encodeURIComponent(cleanAuthor);

    const url = `https://bookcover.longitood.com/bookcover?book_title=${encodedTitle}&author_name=${encodedAuthor}`;
    // console.log(url)

    try {
        const { data } = await axios.get(url);

        if (data?.url) {
            console.log(`Img found with API for "${title}": ${data.url}`)
            return data.url;
        }

        console.warn(`No cover found for "${cleanTitle}"`);
        return null
    } catch (err) {
        console.error(
            `Failed to fetch book cover with API for "${cleanTitle}":`,
            err.message
        );
        return null;
    }
};

export const imgFunc2 = async (lccn, title) => {
    // Check if lccn is provided and is an array
    if (!lccn || !Array.isArray(lccn) || lccn.length === 0) {
        console.log(`Invalid lccn for "${title}"`)
        return null;
    }

    // Iterate through each LCCN in the array
    for (let i = lccn.length - 1; i >= 0; i--) {
        try {
            const url = `https://covers.openlibrary.org/b/lccn/${lccn[i]}-L.jpg?default=false`;

            // Send request to the URL using axios
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 5000 // 5 second timeout
            });

            // Check if the response is successful and is an image
            if (response.status === 200 && response.headers['content-type']?.startsWith('image/')) {
                // Additional check: ensure the response has content
                if (response.data && response.data.byteLength > 0) {
                    console.log(`Img found with lccn for "${title}": ${url}`)
                    return url; // Return the valid image URL
                }
            }
        } catch (error) {
            // Continue to next LCCN if there's an error
            // console.warn(`Failed to fetch image for title: ${title} and LCCN: ${lccn[i]}:`, error.message);
        }
    }

    // Return null if no valid image was found
    console.log(`No cover found wiht lccn for "${title}"`)
    return null;
};