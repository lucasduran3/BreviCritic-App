import { getMovieBydId, searchMovies } from '../../../lib/tmdb.client.js';
import { findMovieById, upsertMovie } from '../queries/movies.queries.js';
import { Movie } from '../types/movies.types.js';
import { TmdbMovieSearchResult } from '../../../lib/tmdb.types.js';

// Tiempo maximo antes de considerar los datos desactualizados en ms
const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export async function getOrFetchMovie(tmdbId: number): Promise<Movie> {
  const existing = await findMovieById(tmdbId);

  if (existing && !isStale(existing.fetchedAt)) {
    return existing;
  }

  const tmdbMovie = await getMovieBydId(tmdbId);
  return upsertMovie(tmdbMovie);
}

export async function searchTmdbMovies(
  query: string,
  page: number = 1,
): Promise<TmdbMovieSearchResult[]> {
  return searchMovies(query, page);
}

function isStale(fetchedAt: Date): boolean {
  return Date.now() - fetchedAt.getTime() > STALE_AFTER_MS;
}
