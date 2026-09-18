import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  secretKey: process.env.SECRET_KEY || 'your-secret-key-change-this-in-production',
  jwtAlgorithm: 'HS256',
  accessTokenExpireMinutes: 60 * 24,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ||
    'http://localhost:5173,https://expence-tracker-gamma-dun.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
