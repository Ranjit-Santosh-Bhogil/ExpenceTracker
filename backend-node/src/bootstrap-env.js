import dotenv from 'dotenv';
import dns from 'node:dns';

dotenv.config();

/**
 * Normalize Neon DATABASE_URL for Prisma/Node.js compatibility.
 */
function normalizeDatabaseUrl(rawUrl) {
  if (!rawUrl) return rawUrl;

  try {
    const url = new URL(rawUrl);
    url.searchParams.delete('channel_binding');

    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
    }

    if (url.hostname.includes('-pooler') && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }

    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', '60');
    }

    return url.toString();
  } catch {
    return rawUrl.replace(/[&?]channel_binding=require/g, '');
  }
}

/**
 * Windows often has broken IPv6 — Neon resolves to both A and AAAA records.
 * Prisma times out trying IPv6 first. Resolve hostname to IPv4 for pg driver.
 */
export function parseDatabaseConfig(rawUrl) {
  const normalized = normalizeDatabaseUrl(rawUrl);
  const url = new URL(normalized);
  const originalHost = url.hostname;

  let host = originalHost;
  try {
    host = dns.lookupSync(originalHost, { family: 4, verbatim: false });
  } catch {
    // Keep original hostname if lookup fails
  }

  return {
    host,
    originalHost,
    port: parseInt(url.port, 10) || 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: true, servername: originalHost },
    max: 5,
    connectionTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
    family: 4,
  };
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
}
