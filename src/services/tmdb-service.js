class TmdbService {
  constructor() {
    this._apiBase = "https://api.themoviedb.org/3";
    this._apiKey = "ee7a986301f6120fa70aedc4b575c066";
  }
  

  async searchMovies(query, page = 1) {
    const response = await fetch(
      `${this._apiBase}/search/movie?api_key=${this._apiKey}&query=${encodeURIComponent(query)}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async createGuestSession() {
    const res = await fetch(`${this._apiBase}/authentication/guest_session/new?api_key=${this._apiKey}`);
    return await res.json();
  }

  async getGenres() {
    const res = await fetch(`${this._apiBase}/genre/movie/list?api_key=${this._apiKey}`);
    return await res.json();
  }

  async rateMovie(movieId, rating, sessionId) {
    const res = await fetch(
      `${this._apiBase}/movie/${movieId}/rating?api_key=${this._apiKey}&guest_session_id=${sessionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: rating }),
      }
    );
    return await res.json();
  }

  async getRatedMovies(sessionId) {
    const res = await fetch(
      `${this._apiBase}/guest_session/${sessionId}/rated/movies?api_key=${this._apiKey}`
    );
    return await res.json();
  }
}

export default new TmdbService();
