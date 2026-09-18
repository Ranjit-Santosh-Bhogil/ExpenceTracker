import app from './app.js';
import { config } from './config.js';
import prisma, { connectWithRetry, disconnectDb } from './db.js';

async function start() {
  try {
    await connectWithRetry();
    app.listen(config.port, () => {
      console.log(`Expense Tracker API running on http://127.0.0.1:${config.port}`);
    });
  } catch (error) {
    console.error('\nFailed to start server:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Open https://console.neon.tech and resume/wake your database');
    console.error('  2. Copy a fresh connection string from Neon dashboard');
    console.error('  3. Remove channel_binding=require from DATABASE_URL');
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await disconnectDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDb();
  process.exit(0);
});

start();
