import React from 'react';




const MovieList = ({ movies }) => {
    return (
      <div className="movie-list">
        {movies.map(movie => (
          <div key={movie.id} className="movie-card">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                alt={movie.title}
                className="movie-poster"
              />
            ) : (
              <div className="poster-placeholder">No poster</div>
            )}
            <div className="movie-info">
              <h3 className="movie-title">{movie.title}</h3>
              <p className="movie-year">
                {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
              </p>
              <p className="movie-rating">Rating: {movie.vote_average}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default MovieList;