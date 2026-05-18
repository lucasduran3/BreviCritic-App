import bcrypt from 'bcrypt';
import { createUser, findUserByIdentifier } from './auth.queries.js';
import { RegisterDTO, LoginDTO } from './auth.types.js';
import { AppError } from '../../shared/errors/AppError.js';
import { generateAccessToken } from '../../shared/utils/tokens.js';

const SALT_ROUNDS = 10;

export async function register(data: RegisterDTO): Promise<{ token: string }> {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user: string = await createUser(data, hashedPassword);
  //devuelve el token para loguear al usuario inmediatamente después de registrarse
  const token = generateAccessToken(user);
  return { token };
}

export async function login(data: LoginDTO): Promise<{ token: string }> {
  const user = await findUserByIdentifier(data.identifier);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }
  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError('Invalid credentials', 401);
  }
  const token = generateAccessToken(user.id);
  return { token };
}
