import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { parseDatabaseConfig } from './bootstrap-env.js';

const { Pool } = pg;

const pool = new Pool(parseDatabaseConfig(process.env.DATABASE_URL));
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export async function connectWithRetry(maxAttempts = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      const isLast = attempt === maxAttempts;
      console.error(
        `Database connection attempt ${attempt}/${maxAttempts} failed:`,
        error.message
      );

      if (isLast) {
        throw error;
      }

      console.log(`Retrying in ${delayMs / 1000}s... (Neon may be waking up)`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function disconnectDb() {
  await prisma.$disconnect();
  await pool.end();
}

export default prisma;
