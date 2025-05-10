import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pagination, Spin } from 'antd';
import { debounce } from 'lodash';
import TmdbService from './services/tmdb-service';
import MovieList from './components/MovieList';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);


  const debouncedSearchRef = useRef(
    debounce(async (searchQuery, page) => {
      if (!searchQuery.trim()) {
        setMovies([]);
        setTotalPages(0);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await TmdbService.searchMovies(searchQuery, page);
        
        setMovies(data.results);
        setTotalPages(data.total_pages);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );
  const handleSearch = useCallback((query, page) => {
    debouncedSearchRef.current(query, page);
  }, []);

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setCurrentPage(1);
    handleSearch(newQuery, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    handleSearch(query, page);
  };

  useEffect(() => {
    const debouncedSearch = debouncedSearchRef.current;
    return () => {
      debouncedSearch.cancel();
    };
  }, []);
  return (
    <div className="app">
      <h1>Movie Search</h1>
      
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search for movies..."
          className="search-input"
        />
      </div>

      {loading && (
        <div className="spinner-container">
          <Spin size="large" />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {!loading && movies.length === 0 && query && (
        <div className="no-results">No movies found for "{query}"</div>
      )}

      <MovieList movies={movies} loading={loading} />

      {movies.length > 0 && totalPages > 1 && (
        <div className="pagination-container">
          <Pagination
            current={currentPage}
            total={totalPages * 10} 
            pageSize={1}
            onChange={handlePageChange}
            showSizeChanger={false}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}

export default App;