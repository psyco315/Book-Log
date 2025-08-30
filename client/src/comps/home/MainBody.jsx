import React, { useState, useRef, useEffect } from 'react'
import BookCollection from './BookCollection'
import { fetchBooks } from '../getData'

const MainBody = () => {

    const [tempData, setTempData] = useState([])

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const data = await fetchBooks({ subject: "fiction" });
                if (data) {
                    // console.log(data.data.books)
                    setTempData(data.data.books); // update state
                }
            } catch (err) {
                // console.error("Failed to fetch books:", err);
            }
        };

        loadBooks();
    }, []);

    // useEffect(() => {
    //     if (tempData) {
    //         console.log("Updated tempData:", tempData);
    //     }
    // }, [tempData]);

    return (
        <div>
            <BookCollection groupTitle={'Trending books of 2025'} bookData={tempData} />
            <BookCollection groupTitle={'Popular Fiction'} bookData={tempData} />
            <BookCollection groupTitle={'Popular Non-Fiction'} bookData={tempData} />
        </div>
    )
}

export default MainBody