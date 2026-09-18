import { parseDatabaseConfig } from '../src/bootstrap-env.js';
import prisma, { connectWithRetry, disconnectDb } from '../src/db.js';

async function checkDb() {
  const config = parseDatabaseConfig(process.env.DATABASE_URL);
  console.log('Connecting via IPv4:', config.host, `(SNI: ${config.originalHost})`);

  try {
    await connectWithRetry();
    const result = await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log('Database connected:', result);
    await disconnectDb();
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('\nWake your database at https://console.neon.tech');
    await disconnectDb();
    process.exit(1);
  }
}

checkDb();
