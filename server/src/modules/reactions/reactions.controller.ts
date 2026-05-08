import { Request, Response, NextFunction } from 'express';
import * as reactionService from './reactions.service.js';

export async function upsertReactionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reactionService.upsertReaction(
      req.userId!,
      req.params.reviewId as string,
      req.body,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function removeReactionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await reactionService.removeReaction(
      req.userId!,
      req.params.reviewId as string,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
