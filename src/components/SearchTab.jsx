import { useState, useContext } from 'react';
import TmdbService from '../services/tmdb-service';
import { AppContext } from '../context/AppContext';
import MovieList from './MovieList';

const SearchTab = () => {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const { sessionId } = useContext(AppContext);
  const tmdbService = new TmdbService();

  const handleSearch = async () => {
    const data = await tmdbService.searchMovies(query);
    setMovies(data.results);
  };

  const handleRate = async (movieId, rating) => {
    await tmdbService.rateMovie(movieId, rating, sessionId);
  };

  return (
    <div className="search-tab">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search movies..."
      />
      <button onClick={handleSearch}>Search</button>

      <MovieList movies={movies} onRate={handleRate} />
    </div>
  );
};

export default SearchTab;
