function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable not found: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  clientUrl: requireEnv('CLIENT_URL'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  },
  db: {
    host: requireEnv('DB_HOST'),
    port: parseInt(requireEnv('DB_PORT'), 10),
    database: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    superUser: requireEnv('DB_SUPER_USER'),
    superPassword: requireEnv('DB_SUPER_PASSWORD'),
  },
  tmdb: {
    apiKey: requireEnv('TMDB_API_KEY'),
    baseUrl: requireEnv('TMDB_BASE_URL'),
  },
  redis: {
    host: requireEnv('REDIS_HOST'),
    port: parseInt(requireEnv('REDIS_PORT'), 10),
    password: requireEnv('REDIS_PASSWORD'),
  },
  nodeEnv: (process.env.NODE_ENV ?? 'development') as
    | 'development'
    | 'production'
    | 'test',
} as const;
