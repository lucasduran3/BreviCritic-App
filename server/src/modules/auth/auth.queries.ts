import pool from '../../db/pool.js';
import { RegisterDTO } from './auth.types.js';

export async function createUser(
  dto: RegisterDTO,
  passwordHash: string,
): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const authResult = await client.query(
      `SELECT auth.register_user($1, $2) AS id`,
      [dto.email, passwordHash],
    );
    const userId = authResult.rows[0].id;

    const insertProfileSQL = `INSERT INTO app.profiles (id, username, name, lastname, country, city, profile_photo, is_public) 
                                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    await client.query(insertProfileSQL, [
      userId,
      dto.username,
      dto.name,
      dto.lastname,
      dto.country,
      dto.city,
      dto.profilePhotoUrl || null,
      dto.isPublic,
    ]);
    await client.query('COMMIT');

    return userId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findUserByIdentifier(
  identifier: string,
): Promise<{ id: string; passwordHash: string } | null> {
  try {
    const query = `SELECT id, password_hash FROM auth.find_user_by_identifier($1)`;

    const result = await pool.query(query, [identifier]);
    if (result.rows.length === 0) {
      return null;
    }
    return {
      id: result.rows[0].id,
      passwordHash: result.rows[0].password_hash,
    };
  } catch (error) {
    console.error('Error finding user by identifier:', error);
    throw error;
  }
}
