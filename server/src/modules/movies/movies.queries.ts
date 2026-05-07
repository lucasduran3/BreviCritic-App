import pool from '../../db/pool.js';
import { TmdbMovieDetail } from '../../lib/tmdb.types.js';
import { Movie } from './movies.types.js';

export async function findMovieById(tmdbId: number): Promise<Movie | null> {
  const result = await pool.query('SELECT * FROM app.movies WHERE id = $1', [
    tmdbId,
  ]);

  if (result.rows.length === 0) return null;

  return mapToMovie(result.rows[0]);
}

export async function upsertMovie(movie: TmdbMovieDetail): Promise<Movie> {
  const result = await pool.query(
    `INSERT INTO app.movies (id, title, overview, poster_path, genres, release_date, fetched_at)
        VALUES($1, $2, $3, $4, $5, $6, now()) 
        ON CLONFICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            overview = EXCLUDED.overview,
            poster_path = EXCLUDED.poster_path,
            genres = EXCLUDED.genres,
            release_date = EXCLUDED.release_date,
            fetched_at = now()
        RETURNING *`,
    [
      movie.id,
      movie.title,
      movie.overview,
      movie.poster_path,
      JSON.stringify(movie.genres),
      movie.release_date || null,
    ],
  );

  return mapToMovie(result.rows[0]);
}

function mapToMovie(row: Record<string, unknown>): Movie {
  return {
    id: row.id as number,
    title: row.title as string,
    overview: (row.overview as string) ?? null,
    posterPath: (row.poster_path as string) ?? null,
    genres: (row.genres as { id: number; name: string }[]) ?? [],
    releaseDate: row.release_date ? new Date(row.release_date as string) : null,
    fetchedAt: row.fetched_at as Date,
  };
}
