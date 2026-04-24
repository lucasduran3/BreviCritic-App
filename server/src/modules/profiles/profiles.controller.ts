import { Request, Response, NextFunction } from 'express';
import * as profileService from './profiles.service.js';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getOwnProfile(req.userId!);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const profile = await profileService.updateProfile(req.userId!, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function getProfileByUsername(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const profile = await profileService.getProfileByUsername(
      req.userId!,
      req.params.username as string,
    );
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function searchProfiles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const filters = {
      search: req.query.search as string | undefined,
      limit: Number(req.query.limit ?? 20),
      offset: Number(req.query.offset ?? 0),
    };

    const profiles = await profileService.searchProfilesWithFilters(filters);
    res.json(profiles);
  } catch (error) {
    next(error);
  }
}
