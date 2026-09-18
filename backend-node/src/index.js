import app from './app.js';
import { config } from './config.js';
import prisma from './db.js';

async function start() {
  try {
    await prisma.$connect();
    app.listen(config.port, () => {
      console.log(`Expense Tracker API running on http://127.0.0.1:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
