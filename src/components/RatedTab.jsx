import { useState, useEffect, useContext } from 'react';
import { TmdbService } from '../services/tmdb-service'
import { AppContext } from '../context/AppContext';
import MovieList from './MovieList';

const RatedTab = () => {
  const [movies, setMovies] = useState([]);
  const { sessionId } = useContext(AppContext);
  const tmdbService = new TmdbService();

  useEffect(() => {
    const fetchRatedMovies = async () => {
      if (sessionId) {
        const data = await TmdbService.getRatedMovies(sessionId);
        setMovies(data.results);
      }
    };
    fetchRatedMovies();
  }, [sessionId]);

  const handleRate = async (movieId, rating) => {
    await tmdbService.rateMovie(movieId, rating, sessionId);
    const data = await tmdbService.getRatedMovies(sessionId);
    setMovies(data.results);
  };

  return (
    <div className="rated-tab">
      <MovieList movies={movies} onRate={handleRate} />
    </div>
  );
};

export default RatedTab;