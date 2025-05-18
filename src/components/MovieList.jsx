import React, { useState } from 'react';
import { Rate, Spin, Alert } from 'antd';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

const MovieList = ({
  movies,
  genres = [],
  onRate,
  showRating = false,
  loading = false,
  error = null,
  ratings = {},
}) => {
  const [failedPosters, setFailedPosters] = useState({});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleImageError = movieId => {
    setFailedPosters(prev => ({ ...prev, [movieId]: true }));
  };

  const handleRateChange = async (movieId, value) => {
    try {
      await onRate?.(movieId, value);
    } catch (error) {
      throw error;
    }
  };

  const getRatingColor = rating => {
    if (rating >= 7) return '#66E900';
    if (rating >= 5) return '#E9D100';
    if (rating >= 3) return '#E97E00';
    return '#E90000';
  };

  const formatReleaseDate = dateString => {
    if (!dateString) return 'Date not specified';
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy', { locale: enUS });
    } catch {
      return dateString;
    }
  };

  if (isOffline) {
    return (
      <Alert
        message="Нет подключения к сети"
        description="Проверьте ваше интернет-соединение и попробуйте снова"
        type="warning"
        showIcon
      />
    );
  }

  if (error) {
    return <Alert message="Произошла ошибка" description={error} type="error" showIcon />;
  }

  if (loading && movies.length === 0) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Загрузка фильмов..." />
      </div>
    );
  }

  if (!loading && movies.length === 0) {
    return (
      <Alert
        message="Фильмы не найдены"
        description="Попробуйте изменить параметры поиска"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div className="movie-list">
      {movies.map(movie => (
        <div key={movie.id} className="movie-card">
          <div className="movie-poster-container">
            {failedPosters[movie.id] || !movie.poster_path ? (
              <div className="poster-placeholder">{movie.title.charAt(0).toUpperCase()}</div>
            ) : (
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="movie-poster"
                onError={() => handleImageError(movie.id)}
                loading="lazy"
              />
            )}
            <div
              className="rating-circle"
              style={{ backgroundColor: getRatingColor(movie.vote_average) }}
            >
              {movie.vote_average.toFixed(1)}
            </div>
          </div>

          <div className="movie-info">
            <h3 className="movie-title">{movie.title}</h3>
            <p className="movie-release-date">{formatReleaseDate(movie.release_date)}</p>

            <div className="movie-genres">
              {movie.genre_ids?.slice(0, 2).map(id => (
                <span key={id} className="movie-genre">
                  {genres.find(g => g.id === id)?.name || 'Unknown'}
                </span>
              ))}
            </div>

            <p className="movie-overview">{movie.overview || 'No description available'}</p>

            <div className="movie-rating-container">
              <div className="movie-rating-wrapper">
                <Spin spinning={loading && ratings[movie.id] !== undefined}>
                  <Rate
                    count={10}
                    value={ratings[movie.id] || 0}
                    onChange={value => handleRateChange(movie.id, value)}
                    className="movie-rate"
                    allowHalf
                    disabled={isOffline}
                  />
                </Spin>
                {ratings[movie.id] && (
                  <span className="movie-rating-value">{ratings[movie.id]}/10</span>
                )}
              </div>
              {showRating && movie.rating && !ratings[movie.id] && (
                <div className="movie-previous-rating">Your previous rating: {movie.rating}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieList;
