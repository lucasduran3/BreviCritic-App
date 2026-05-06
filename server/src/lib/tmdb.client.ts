import { config } from '../config/env.js';
import { AppError } from '../shared/errors/AppError.js';
import {
  TmdbMovieDetail,
  TmdbMovieSearchResult,
  TmdbSearchResponse,
} from './tmdb.types.js';

export async function searchMovies(
  query: string,
  page: number = 1,
): Promise<TmdbMovieSearchResult[]> {
  const data = await tmdbFetch<TmdbSearchResponse>('/search/movie', {
    query,
    page: String(page),
  });

  return data.results;
}

export async function getMovieBydId(tmdbId: number): Promise<TmdbMovieDetail> {
  return tmdbFetch<TmdbMovieDetail>(`/movie/${tmdbId}`);
}

async function tmdbFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = buildUrl(path, params);

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new AppError('Could not reach TMDB', 503);
  }

  if (response.status === 404) {
    throw new AppError('Movie not found on TMDB', 404);
  }

  if (response.status === 404) {
    throw new AppError('Invalid TMDB API key', 500);
  }

  if (!response.ok) {
    throw new AppError(`TMDB error: ${response.status}`, 502);
  }

  return response.json() as Promise<T>;
}

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${config.tmdb.baseUrl}${path}`);
  url.searchParams.set('api_key', config.tmdb.apiKey);
  url.searchParams.set('language', 'en-US');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}
