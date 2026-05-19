import bcrypt from 'bcrypt';
import { createUser, findUserByIdentifier } from './auth.queries.js';
import { RegisterDTO, LoginDTO } from './auth.types.js';
import { AppError } from '../../shared/errors/AppError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/tokens.js';

const SALT_ROUNDS = 10;

export async function register(
  data: RegisterDTO,
): Promise<{ accessToken: string; refreshToken: string }> {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user: string = await createUser(data, hashedPassword);
  //devuelve el token para loguear al usuario inmediatamente después de registrarse
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  return { accessToken, refreshToken };
}

export async function login(
  data: LoginDTO,
): Promise<{ accessToken: string; refreshToken: string }> {
  const user = await findUserByIdentifier(data.identifier);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }
  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError('Invalid credentials', 401);
  }
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);
  return { accessToken, refreshToken };
}

export async function logout(refreshToken: string): Promise<void> {
  await revokeRefreshToken(refreshToken);
}

// verifica refresh token, rota, retorna nuevos tokens
export async function refreshTokens(
  token: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const userId = await verifyRefreshToken(token);
  if (!userId) {
    throw new AppError('Invalid refresh token', 401);
  }

  await revokeRefreshToken(token);
  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = await generateRefreshToken(userId);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
