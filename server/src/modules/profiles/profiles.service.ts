import { withUser } from '../../db/withUser.js';
import { AppError } from '../../shared/errors/AppError.js';
import {
  Profile,
  PublicProfile,
  ProfileSearchResult,
  ProfileSearchFilters,
  UpdateProfileDTO,
} from './profiles.types.js';
import {
  findOwnProfile,
  updateOwnProfile,
  findProfileByUsername,
  searchProfiles,
} from './profiles.queries.js';

export async function getOwnProfile(userId: string): Promise<Profile> {
  return withUser(userId, async (client) => {
    const profile = await findOwnProfile(client, userId);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }
    return profile;
  });
}

export async function getProfileByUsername(
  userId: string,
  username: string,
): Promise<PublicProfile> {
  return withUser(userId, async (client) => {
    const profile = await findProfileByUsername(client, username);

    // segunda query sin rls para verificar si es privado o no existe
    if (!profile) {
      const exists = await client.query(
        'SELECT is_public FROM app.profile_search WHERE username = $1',
        [username],
      );

      if (exists.rows.length === 0)
        throw new AppError('Profile not found', 404);

      throw new AppError('This profile is private', 403);
    }

    return profile;
  });
}

// No necesita RLS porque usa la vista profile_search sin RLS
export async function searchProfilesWithFilters(
  filters: ProfileSearchFilters,
): Promise<ProfileSearchResult[]> {
  return await searchProfiles(filters);
}

export async function updateProfile(
  userId: string,
  dto: UpdateProfileDTO,
): Promise<Profile> {
  return withUser(userId, async (client) => {
    try {
      const updatedProfile = await updateOwnProfile(client, userId, dto);
      if (!updatedProfile) {
        throw new AppError('Profile not found', 404);
      }
      return updatedProfile;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new AppError('Username already taken', 409);
      }
      throw error;
    }
  });
}
