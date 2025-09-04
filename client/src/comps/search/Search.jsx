import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookCard from '../BookCard'
import { fetchBooks } from '../getData'
import './search.css'
import { motion } from 'motion/react'
import Navbar from '../home/Navbar'

const Search = () => {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [totalPages, setTotalPages] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [searchType, setSearchType] = useState("all")

    const location = useLocation()
    const navigate = useNavigate()
    const isInitialMount = useRef(true)

    // Extract query and page from URL params
    const searchParams = new URLSearchParams(location.search)
    const query = searchParams.get('q') || ''
    const subject = searchParams.get('subject') || ''
    const urlPage = parseInt(searchParams.get('page')) || 1

    // Current page always comes from URL
    const currentPage = urlPage

    const updateURL = (newPage) => {
        const newSearchParams = new URLSearchParams(location.search)
        if (newPage > 1) {
            newSearchParams.set('page', newPage.toString())
        } else {
            newSearchParams.delete('page')
        }
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true })
    }

    const searchBooks = async (page = 1) => {
        // console.log("Halo")
        if (!query.trim() && !subject.trim()) return

        setLoading(true)
        setError(null)

        try {
            // console.log("Fetching data for page:", page, "Query:", query)
            let reqData = { page: page, limit: 12 }
            if (subject === '') {
                if (searchType === "all") {
                    reqData.q = query
                }
                else if (searchType === "book") {
                    reqData.title = query
                }
                else if (searchType === "author") {
                    reqData.author = query
                }
            }
            else{
                reqData.subject = subject
            }
            // console.log("Searching for:", reqData)
            const data = await fetchBooks(reqData)
            console.log("Data fetched successfully:", data.data)

            setBooks(data.data.books || [])
            setTotalResults(data.data.total || 0)

            // Calculate total pages
            const booksPerPage = data.data.booksPerPage || 20
            const calculatedTotalPages = Math.ceil((data.data.total || 0) / booksPerPage)
            setTotalPages(calculatedTotalPages)

        } catch (err) {
            setError('Failed to fetch search results')
            console.error('Search error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Main effect: search when query or page changes
    useEffect(() => {
        // console.log("Effect triggered - Query:", query, "Subject:", subject, "Page:", currentPage)

        if (query.trim() || subject.trim()) {
            searchBooks(currentPage)
        } else {
            // Clear results if no query
            setBooks([])
            setTotalResults(0)
            setTotalPages(1)
        }

        // Mark that initial mount is complete
        if (isInitialMount.current) {
            isInitialMount.current = false
        }
    }, [query, currentPage, searchType])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            console.log("Page change requested:", newPage)
            updateURL(newPage)
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const renderPaginationButtons = () => {
        const buttons = []
        const maxButtons = 7 // Maximum number of pagination buttons to show

        if (totalPages <= maxButtons) {
            // Show all pages if total pages is small
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`paginationButton ${i === currentPage ? 'active' : ''}`}
                    >
                        {i}
                    </button>
                )
            }
        } else {
            // Show first page
            buttons.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className={`paginationButton ${1 === currentPage ? 'active' : ''}`}
                >
                    1
                </button>
            )

            // Show ellipsis if current page is far from start
            if (currentPage > 4) {
                buttons.push(
                    <span key="ellipsis1" className="paginationEllipsis">...</span>
                )
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                buttons.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`paginationButton ${i === currentPage ? 'active' : ''}`}
                    >
                        {i}
                    </button>
                )
            }

            // Show ellipsis if current page is far from end
            if (currentPage < totalPages - 3) {
                buttons.push(
                    <span key="ellipsis2" className="paginationEllipsis">...</span>
                )
            }

            // Show last page
            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className={`paginationButton ${totalPages === currentPage ? 'active' : ''}`}
                >
                    {totalPages}
                </button>
            )
        }

        return buttons
    }

    return (
        <div className='searchPage relative hover:cursor-default min-h-screen text-white/80 flex flex-col items-center'>
            <Navbar />

            <motion.div
                className='searchContentBox'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut"
                }}
            >
                <div className="searchHeader">
                    <h1 className="searchTitle">
                        {query || subject ? (
                            <>
                                Search results for <span className="searchQuery">"{query || subject}"</span>
                            </>
                        ) : 'Search Results'}
                    </h1>

                    {/* Search Type Filter */}
                    {(query || subject) && (
                        <div className="searchTypeContainer">
                            <div className="searchTypeButtons">
                                <button
                                    onClick={() => setSearchType('all')}
                                    className={`searchTypeButton ${searchType === 'all' ? 'activeType' : ''}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setSearchType('book')}
                                    className={`searchTypeButton ${searchType === 'book' ? 'activeType' : ''}`}
                                >
                                    Books
                                </button>
                                <button
                                    onClick={() => setSearchType('author')}
                                    className={`searchTypeButton ${searchType === 'author' ? 'activeType' : ''}`}
                                >
                                    Authors
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && totalResults > 0 && (
                        <p className="searchCount">
                            {totalResults.toLocaleString()} found
                            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                        </p>
                    )}
                </div>

                <div className="searchResults">
                    {loading ? (
                        <div className="loadingContainer">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="loadingCard">
                                    <div className="loadCover">
                                        <div className="loadAni animate-pulse bg-white/20 rounded"></div>
                                    </div>
                                    <div className="cardInfo">
                                        <div className="h-4 bg-white/20 rounded mb-2 animate-pulse"></div>
                                        <div className="h-3 bg-white/20 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="errorContainer">
                            <div className="errorMessage">
                                <h3>Oops! Something went wrong</h3>
                                <p>{error}</p>
                            </div>
                        </div>
                    ) : books.length === 0 && query ? (
                        <div className="noResults">
                            <div className="noResultsMessage">
                                <h3>No books found</h3>
                                <p>Try adjusting your search terms or check for typos</p>
                            </div>
                        </div>
                    ) : query || subject ? (
                        <>
                            <div className="resultsGrid">
                                {books.map((book, index) => (
                                    <motion.div
                                        key={book.lccn || book.isbn || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.1,
                                            ease: "easeOut"
                                        }}
                                    >
                                        <BookCard data={book} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <motion.div
                                    className="paginationContainer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.2,
                                        ease: "easeOut"
                                    }}
                                >
                                    <div className="paginationControls">
                                        {/* Previous Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="paginationArrow"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" />
                                            </svg>
                                            Previous
                                        </button>

                                        {/* Page Numbers */}
                                        <div className="paginationNumbers">
                                            {renderPaginationButtons()}
                                        </div>

                                        {/* Next Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="paginationArrow"
                                        >
                                            Next
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <div className="noQuery">
                            <div className="noQueryMessage">
                                <h3>Enter a search term</h3>
                                <p>Use the search bar above to find books</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default Search