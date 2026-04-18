import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { createUser, findUserByIdentifier } from './auth.queries.js';
import { RegisterDTO, LoginDTO, JWTPayload } from './auth.types.js';
import { AppError } from '../../shared/errors/AppError.js';
import { config } from '../../config/env.js';

const SALT_ROUNDS = 10; 

export async function register(data: RegisterDTO) : Promise<{ token: string }> {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user : string = await createUser(data, hashedPassword);
    //devuelve el token para loguear al usuario inmediatamente después de registrarse
    const token = generateToken(user);
    return { token };
}

export async function login(data: LoginDTO) : Promise<{ token: string }> {
    const user = await findUserByIdentifier(data.identifier);
    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }
    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatch) {
        throw new AppError('Invalid credentials', 401);
    }
    const token = generateToken(user.id);
    return { token };
}

function generateToken(userId: string): string {
  const payload: JWTPayload = { sub: userId };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  });
}
