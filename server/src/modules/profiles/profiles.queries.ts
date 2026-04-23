import pool from '../../db/pool.js';
import { Pool, PoolClient } from 'pg';
import {
  UpdateProfileDTO,
  ProfileSearchFilters,
  ProfileSearchResult,
  Profile,
  PublicProfile,
} from './profiles.types.js';

export async function findOwnProfile(
  client: PoolClient,
  userId: string,
): Promise<Profile | null> {
  try {
    const result = await client.query(
      'SELECT * FROM app.profiles WHERE id = $1',
      [userId],
    );

    if (result.rows.length === 0) return null;
    return mapToProfile(result.rows[0]);
  } catch (error) {
    console.error('Error fetching own profile:', error);
    throw error;
  }
}

export async function updateOwnProfile(
  client: PoolClient,
  userId: string,
  dto: UpdateProfileDTO,
): Promise<Profile | null> {
  const fieldMap: Record<keyof UpdateProfileDTO, string> = {
    username: 'username',
    name: 'name',
    lastname: 'lastname',
    country: 'country',
    city: 'city',
    profilePhotoUrl: 'profile_photo',
    isPublic: 'is_public',
  };

  //SET dinamico
  const entries = Object.entries(dto) as [keyof UpdateProfileDTO, unknown][];
  const setClauses = entries.map(
    ([key], index) => `${fieldMap[key]} = $${index + 1}`,
  );

  const values = entries.map(([, value]) => value);

  if (setClauses.length === 0) return findOwnProfile(client, userId); // No hay cambios, devuelve el perfil actual

  try {
    const result = await client.query(
      `UPDATE app.profiles SET ${setClauses.join(', ')} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, userId],
    );

    if (result.rows.length === 0) return null;
    return mapToProfile(result.rows[0]);
  } catch (error) {
    console.error('Error updating own profile:', error);
    throw error;
  }
}

// Requiere RLS para verificar visibilidad
export async function findProfileByUsername(
  client: PoolClient,
  username: string,
): Promise<PublicProfile | null> {
  try {
    const result = await client.query(
      `SELECT username, name, lastname, country, city, profile_photo, is_public, created_at FROM app.profiles WHERE username = $1`,
      [username],
    );
    if (result.rows.length === 0) return null;
    return mapToPublicProfile(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    throw error;
  }
}

export async function searchProfiles(
  filters: ProfileSearchFilters,
): Promise<ProfileSearchResult[]> {
  const { search, limit, offset } = filters;

  try {
    const result = await pool.query(
      `SELECT id, username, profile_photo 
     FROM app.profile_search
     WHERE ($1::text IS NULL OR username ILIKE '%' || $1 || '%')
     ORDER BY username DESC
     LIMIT $2 OFFSET $3`,
      [search || null, limit, offset],
    );

    return result.rows.map(mapToSearchResult);
  } catch (error) {
    console.error('Error searching profiles:', error);
    throw error;
  }
}

//-- Mappers
function mapToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    username: row.username as string,
    name: row.name as string,
    lastname: row.lastname as string,
    country: row.country as string,
    city: row.city as string,
    profilePhotoUrl: (row.profile_photo as string) ?? null,
    isPublic: row.is_public as boolean,
    createdAt: row.created_at as Date,
  };
}

function mapToPublicProfile(row: Record<string, unknown>): PublicProfile {
  return {
    username: row.username as string,
    name: row.name as string,
    lastname: row.lastname as string,
    country: row.country as string,
    city: row.city as string,
    profilePhotoUrl: (row.profile_photo as string) ?? null,
    isPublic: row.is_public as boolean,
    createdAt: row.created_at as Date,
  };
}

function mapToSearchResult(row: Record<string, unknown>): ProfileSearchResult {
  return {
    id: row.id as string,
    username: row.username as string,
    profilePhotoUrl: (row.profile_photo as string) ?? null,
  };
}
