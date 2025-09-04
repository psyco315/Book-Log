import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../home/Navbar';
import { fetchBooks } from '../getData';
import { imgFunc1, imgFunc2, imgFunc3 } from '../getData';
import Lottie from 'react-lottie-player';
import { useAuth } from '@/context/auth';

import loadingAnimation from '../../assets/loading_gray.json';
import defCover from '../../assets/defCover.png';
import star2 from '../../assets/star2.png';
import search from '../../assets/search.png';
// import filterIcon from '../../assets/filter.svg';
import './library.css';

const Library = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        author: '',
        subject: '',
        language: '',
        yearFrom: '',
        yearTo: '',
        sortBy: 'relevance'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [loadingCovers, setLoadingCovers] = useState({});

    const { setOnSearch } = useAuth()

    const navigate = useNavigate();
    const resultsPerPage = 20;

    // Clean and format book data
    const formatBookData = (book) => {
        return {
            ...book,
            ratings_average: book.ratings_average ? parseFloat(book.ratings_average).toFixed(1) : null,
            subject: book.subject ? book.subject.slice(0, 3) : [], // Limit genres shown
        };
    };

    // Load book cover
    const loadBookCover = async (book, bookIndex) => {
        if (loadingCovers[bookIndex]) return;

        setLoadingCovers(prev => ({ ...prev, [bookIndex]: true }));

        try {
            let coverUrl = await imgFunc1(book.title, book.author_name);

            if (!coverUrl) {
                coverUrl = await imgFunc2(book.lccn, book.title);
            }

            if (!coverUrl) {
                coverUrl = await imgFunc3(book.isbn, book.title);
            }

            if (coverUrl) {
                setSearchResults(prev => prev.map((result, idx) =>
                    idx === bookIndex ? { ...result, coverImage: coverUrl } : result
                ));
            }
        } catch (error) {
            console.error('Error loading cover:', error);
        } finally {
            setLoadingCovers(prev => ({ ...prev, [bookIndex]: false }));
        }
    };

    // Perform search
    const performSearch = async (page = 1) => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);

        try {
            const searchParams = {
                q: searchQuery,
                limit: resultsPerPage,
                offset: (page - 1) * resultsPerPage,
                ...filters
            };

            // Clean empty filters
            Object.keys(searchParams).forEach(key => {
                if (searchParams[key] === '' || searchParams[key] === null) {
                    delete searchParams[key];
                }
            });

            const response = await fetchBooks(searchParams);

            if (response?.data?.books) {
                const formattedBooks = response.data.books.map(formatBookData);
                setSearchResults(formattedBooks);
                setTotalPages(Math.ceil((response.data.numFound || 0) / resultsPerPage));
                setCurrentPage(page);
                setHasSearched(true);

                // Load covers for first few results
                formattedBooks.slice(0, 6).forEach((book, index) => {
                    setTimeout(() => loadBookCover(book, index), index * 200);
                });
            } else {
                setSearchResults([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        performSearch(1);
    };

    // Handle filter change
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            author: '',
            subject: '',
            language: '',
            yearFrom: '',
            yearTo: '',
            sortBy: 'relevance'
        });
    };

    // Navigate to book page
    const handleBookClick = (book) => {
        const isbn = Array.isArray(book.isbn) ? book.isbn[0] : book.isbn;
        if (isbn) {
            navigate(`/book/${isbn}`);
        }
    };

    // Pagination
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            performSearch(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
      setOnSearch(true)
    
      return () => {
        setOnSearch(false)
      }
    }, [])
    

    return (
        <div className="globalDiv">
            <Navbar />

            <motion.div
                className="searchContainer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Search Header */}
                <div className="searchHeader">
                    <h1 className="searchTitle">Discover Books</h1>
                    <p className="searchSubtitle">Search through millions of books to find your next read</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="searchForm">
                    <div className="searchInputGroup">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for books, authors, or subjects..."
                            className="searchInput"
                        />
                        <button
                            type="submit"
                            className="searchButton"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Lottie
                                    loop
                                    animationData={loadingAnimation}
                                    play
                                    style={{ width: 20, height: 20 }}
                                />
                            ) : (
                                'Search'
                            )}
                        </button>
                    </div>
                </form>

                {/* Filter Toggle */}
                <div className="filterToggle">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`filterButton ${showFilters ? 'active' : ''}`}
                    >
                        Filters
                        <span className={`filterArrow ${showFilters ? 'rotated' : ''}`}>▼</span>
                    </button>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            className="filtersPanel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="filtersGrid">
                                <div className="filterGroup">
                                    <label>Author</label>
                                    <input
                                        type="text"
                                        value={filters.author}
                                        onChange={(e) => handleFilterChange('author', e.target.value)}
                                        placeholder="Author name"
                                        className="filterInput"
                                    />
                                </div>

                                <div className="filterGroup">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        value={filters.subject}
                                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                                        placeholder="Fiction, Science, etc."
                                        className="filterInput"
                                    />
                                </div>

                                <div className="filterGroup">
                                    <label>Language</label>
                                    <select
                                        value={filters.language}
                                        onChange={(e) => handleFilterChange('language', e.target.value)}
                                        className="filterSelect"
                                    >
                                        <option value="">Any Language</option>
                                        <option value="eng">English</option>
                                        <option value="spa">Spanish</option>
                                        <option value="fre">French</option>
                                        <option value="ger">German</option>
                                        <option value="ita">Italian</option>
                                    </select>
                                </div>

                                <div className="filterGroup">
                                    <label>Year From</label>
                                    <input
                                        type="number"
                                        value={filters.yearFrom}
                                        onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                                        placeholder="1900"
                                        className="filterInput"
                                        min="1000"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                <div className="filterGroup">
                                    <label>Year To</label>
                                    <input
                                        type="number"
                                        value={filters.yearTo}
                                        onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                                        placeholder="2024"
                                        className="filterInput"
                                        min="1000"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                <div className="filterGroup">
                                    <label>Sort By</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="filterSelect"
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="new">Newest First</option>
                                        <option value="old">Oldest First</option>
                                        <option value="rating">Highest Rated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="filterActions">
                                <button
                                    onClick={clearFilters}
                                    className="clearFiltersBtn"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => performSearch(1)}
                                    className="applyFiltersBtn"
                                    disabled={isLoading}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section */}
                {hasSearched && (
                    <motion.div
                        className="resultsSection"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Results Header */}
                        <div className="resultsHeader">
                            <h2>Search Results</h2>
                            {!isLoading && searchResults.length > 0 && (
                                <p className="resultsCount">
                                    Showing {((currentPage - 1) * resultsPerPage) + 1}-{Math.min(currentPage * resultsPerPage, searchResults.length)} results
                                </p>
                            )}
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="loadingContainer">
                                <Lottie
                                    loop
                                    animationData={loadingAnimation}
                                    play
                                    style={{ width: 80, height: 80 }}
                                />
                                <p>Searching books...</p>
                            </div>
                        )}

                        {/* No Results */}
                        {!isLoading && searchResults.length === 0 && (
                            <div className="noResults">
                                <h3>No books found</h3>
                                <p>Try adjusting your search terms or filters</p>
                            </div>
                        )}

                        {/* Results Grid */}
                        {!isLoading && searchResults.length > 0 && (
                            <>
                                <div className="resultsGrid">
                                    {searchResults.map((book, index) => (
                                        <motion.div
                                            key={`${book.key || book.isbn}-${index}`}
                                            className="bookCard"
                                            onClick={() => handleBookClick(book)}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02, y: -5 }}
                                        >
                                            <div className="bookCover">
                                                {loadingCovers[index] ? (
                                                    <div className="coverLoading">
                                                        <Lottie
                                                            loop
                                                            animationData={loadingAnimation}
                                                            play
                                                            style={{ width: 40, height: 40 }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={book.coverImage || defCover}
                                                        alt={book.title}
                                                        onError={(e) => {
                                                            e.target.src = defCover;
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <div className="bookInfo">
                                                <h3 className="bookTitle">{book.title}</h3>

                                                {book.author_name && book.author_name.length > 0 && (
                                                    <p className="bookAuthor">
                                                        by {book.author_name.slice(0, 2).join(', ')}
                                                        {book.author_name.length > 2 && ' & others'}
                                                    </p>
                                                )}

                                                {book.first_publish_year && (
                                                    <p className="bookYear">{book.first_publish_year}</p>
                                                )}

                                                {book.ratings_average && (
                                                    <div className="bookRating">
                                                        <img src={star2} alt="rating" />
                                                        <span>{book.ratings_average}</span>
                                                    </div>
                                                )}

                                                {book.subject && book.subject.length > 0 && (
                                                    <div className="bookGenres">
                                                        {book.subject.slice(0, 3).map((genre, idx) => (
                                                            <span key={idx} className="genreTag">
                                                                {genre}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="paginationBtn"
                                        >
                                            Previous
                                        </button>

                                        <div className="paginationNumbers">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const page = Math.max(1, currentPage - 2) + i;
                                                if (page <= totalPages) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`paginationNumber ${page === currentPage ? 'active' : ''}`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="paginationBtn"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Library;