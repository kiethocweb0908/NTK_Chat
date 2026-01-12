import { getEnv } from '../utils/get-env';

export const Env = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', '9000'),
  MONGO_URL: getEnv('MONGO_URL'),
  ACCESS_TOKEN_SECRET: getEnv('ACCESS_TOKEN_SECRET', 'secret_jwt'),
  ACCESS_TOKEN_TTL: getEnv('ACCESS_TOKEN_TTL', '15m'),
  REFRESH_TOKEN_TTL: getEnv('REFRESH_TOKEN_TTL', '7d'),
  FRONTEND_ORIGIN: getEnv('FRONTEND_ORIGIN', 'http://localhost:5173'),
} as const;
