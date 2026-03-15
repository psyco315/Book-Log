import React, { useState, useRef, useEffect } from 'react'
import BookCollection from './BookCollection'
import { fetchBooks } from '../getData'

const MainBody = () => {

    const [data1, setData1] = useState([])
    const [data2, setData2] = useState([])

    useEffect(() => {
        const loadBooks1 = async (subj) => {
            try {
                const data = await fetchBooks({ subject: "fiction" });
                if (data) {
                    setData1(data.data.books) // update state
                }
            } catch (err) {
                // console.error("Failed to fetch books:", err);
            }
        };
        const loadBooks2 = async (subj) => {
            try {
                const data = await fetchBooks({ subject: "non_fiction" });
                if (data) {
                    setData2(data.data.books)  // update state
                }
            } catch (err) {
                // console.error("Failed to fetch books:", err);
            }
        };
    

        loadBooks1();
        loadBooks2();
    }, []);

    return (
        <div>
            <BookCollection groupTitle={'Popular Fiction'} bookData={data1} />
            <BookCollection groupTitle={'Popular Non-Fiction'} bookData={data2} />
        </div>
    )
}

export default MainBody