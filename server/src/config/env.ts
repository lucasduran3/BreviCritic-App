function requireEnv(key: string) : string {
    const value = process.env[key];
    if (value === undefined || value === '') {
        throw new Error(`Environment variable not found: ${key}`);
    }
    return value;
}

export const config = {
    port: parseInt(process.env.PORT ?? '3000', 10),
    clientUrl: requireEnv('CLIENT_URL'),
    db: {
        host: requireEnv('DB_HOST'),
        port: parseInt(requireEnv('DB_PORT'), 10),
        database: requireEnv('DB_NAME'),
        user: requireEnv('DB_USER'),
        password: requireEnv('DB_PASSWORD'),
    }, 
    nodeEnv: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
} as const;