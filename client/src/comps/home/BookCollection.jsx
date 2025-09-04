import React, { useRef, useEffect } from 'react'
import BookCard from "../BookCard"
import { Link } from 'react-router-dom'

const BookCollection = ({ groupTitle, bookData }) => {
    const itemsRef = useRef(null)

    useEffect(() => {
        console.log(bookData)
        const el = itemsRef.current
        if (!el) return

        const handleWheel = (e) => {
            // allow horizontal scroll only inside the cardBox
            e.preventDefault()
            e.stopPropagation()
            el.scrollLeft += e.deltaY
        }

        // attach with passive: false so preventDefault works
        el.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            el.removeEventListener('wheel', handleWheel)
        }
    }, [])

    return (
        <div className='bookCollec'>
            <div>
                {groupTitle}
            </div>

            <div
                className='cardBox flex overflow-x-auto'
                ref={itemsRef}
            >
                {bookData.length !== 0 ? bookData.map((item, index) => (
                    <BookCard key={index} data={item} />
                ))
                    :
                    <></>
                }
            </div>
        </div>
    )
}

export default BookCollection
