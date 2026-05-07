import { NextFunction, Request, Response } from 'express';
import * as followsService from './follows.service.js';

export async function followUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await followsService.followUser(req.userId!, req.params.username as string);
    res.status(201).json({ message: 'Following successfully' });
  } catch (error) {
    next(error);
  }
}

export async function unfollowUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await followsService.unfollowUser(
      req.userId!,
      req.params.username as string,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
