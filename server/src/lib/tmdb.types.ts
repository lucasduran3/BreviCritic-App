export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  genres: TmdbGenre[];
  release_date: string;
}

// Cada item dentro de results en GET /search/movie
export interface TmdbMovieSearchResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  genre_ids: number[]; // Search no devuelve generos completos solo IDs
  release_date: string;
}

// Respuesta de GET /search/movie
export interface TmdbSearchResponse {
  page: number;
  results: TmdbMovieSearchResult[];
  total_pages: number;
  total_results: number;
}
