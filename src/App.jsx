import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
import { Pagination, Spin, Tabs } from 'antd';
import { debounce } from 'lodash';
import { TmdbService } from './services/tmdb-service'
import MovieList from './components/MovieList';
import { AppContext } from './context/AppContext';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('search');
  const [ratedMovies, setRatedMovies] = useState([]);
  const { sessionId, genres } = useContext(AppContext);
  
  const tmdbService = useMemo(() => new TmdbService(), []);

  const loadPopularMovies = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.getPopularMovies(page);
      setMovies(data.results);
      setTotalPages(data.total_pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [tmdbService]);

  const debouncedSearchRef = useRef(
    debounce(async (searchQuery, page) => {
      if (!searchQuery.trim()) {
        loadPopularMovies(page);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await tmdbService.searchMovies(searchQuery, page);
        
        setMovies(data.results);
        setTotalPages(data.total_pages);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }, 500)
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
    if (query.trim()) {
      handleSearch(query, page);
    } else {
      loadPopularMovies(page);
    }
  };

  const fetchRatedMovies = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const data = await tmdbService.getRatedMovies(sessionId);
      setRatedMovies(data.results || []);
    } catch (err) {
      console.error('Failed to fetch rated movies:', err);
      setRatedMovies([]); 
      setError('Failed to load your rated movies');
    } finally {
      setLoading(false);
    }
  }, [sessionId, tmdbService]);

  const handleRateMovie = async (movieId, rating) => {
    try {
      await tmdbService.rateMovie(movieId, rating, sessionId);
      if (activeTab === 'rated') {
        await fetchRatedMovies();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const debouncedSearch = debouncedSearchRef.current;
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'rated') {
      fetchRatedMovies();
    }
  }, [activeTab, fetchRatedMovies]);

  useEffect(() => {
    if (activeTab === 'search' && !query.trim()) {
      loadPopularMovies(1);
    }
  }, [activeTab, loadPopularMovies, query]);

  if (!sessionId) {
    return (
      <div className="app-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large">
          <div style={{ padding: '20px', color: '#1890ff' }}>Loading application...</div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="app">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'search',
            label: 'Search',
            children: (
              <>
                <div className="search-container">
                  <input
                    type="text"
                    value={query}
                    onChange={handleSearchChange}
                    placeholder="Search for movies..."
                    className="search-input"
                    disabled={loading}
                  />
                </div>

                {loading && (
                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '10px' }}>Searching movies...</div>
                  </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <MovieList 
                  movies={movies} 
                  genres={genres}
                  onRate={handleRateMovie}
                  loading={loading}
                  error={error}
                />

                {movies.length > 0 && totalPages > 1 && (
                  <div className="pagination-container">
                    <Pagination
                      current={currentPage}
                      total={totalPages * 10}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      disabled={loading}
                    />
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'rated',
            label: 'Rated',
            children: (
              <>
                {loading ? (
                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '10px' }}>Loading your ratings...</div>
                  </div>
                ) : (
                  <>
                    {ratedMovies.length === 0 ? (
                      <div className="no-results">You haven't rated any movies yet</div>
                    ) : (
                      <MovieList 
                        movies={ratedMovies} 
                        genres={genres}
                        onRate={handleRateMovie}
                        showRating
                        loading={loading}
                        error={error}
                      />
                    )}
                  </>
                )}
              </>
            ),
          },
        ]}
      />
    </div>
  );
}

export default App;