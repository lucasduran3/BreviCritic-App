import { Request, Response, NextFunction } from 'express';
import * as moviesService from './movies.service.js';

export async function getMovie(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tmdbId = Number(req.params.tmdbId);
    const movie = await moviesService.getOrFetchMovie(tmdbId);
    res.json(movie);
  } catch (error) {
    next(error);
  }
}

export async function searchMovies(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.query.query as string;
    const page = Number(req.query.page ?? 1);
    const results = await moviesService.searchTmdbMovies(query, page);
    res.json(results);
  } catch (error) {
    next(error);
  }
}
