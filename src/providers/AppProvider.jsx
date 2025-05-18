import React, { useState, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { TmdbService } from '../services/tmdb-service';

const AppProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [genres, setGenres] = useState([]);

  const tmdbService = useMemo(() => new TmdbService(), []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const session = await tmdbService.createGuestSession();
        setSessionId(session.guest_session_id);

        const genresData = await tmdbService.getGenres();
        setGenres(genresData.genres);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();
  }, [tmdbService]);

  const contextValue = useMemo(
    () => ({
      sessionId,
      genres,
      tmdbService,
    }),
    [sessionId, genres, tmdbService]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppProvider;
