import { Request, Response, NextFunction } from 'express';
import * as reviewService from './reviews.service.js';

export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const newReview = await reviewService.createReview(req.userId!, req.body);
    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
}

export async function getReviewById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const review = await reviewService.getReviewById(
      req.userId!,
      req.params.reviewId as string,
    );
    res.json(review);
  } catch (error) {
    next(error);
  }
}

export async function getReviewsByUsername(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const filters = {
      limit: Number(req.query.limit ?? 20),
      offset: Number(req.query.offset ?? 0),
    };

    const reviews = await reviewService.getReviewsByUsername(
      req.userId!,
      req.params.username as string,
      filters,
    );
    res.json(reviews);
  } catch (error) {
    next(error);
  }
}

export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const review = await reviewService.updateReview(
      req.userId!,
      req.params.reviewId as string,
      req.body,
    );
    res.json(review);
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await reviewService.deleteReview(
      req.userId!,
      req.params.reviewId as string,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
