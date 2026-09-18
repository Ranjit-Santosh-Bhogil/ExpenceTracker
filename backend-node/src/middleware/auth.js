import prisma from '../db.js';
import { decodeAccessToken } from '../auth/jwt.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = decodeAccessToken(token);
    const userId = payload.sub ? parseInt(payload.sub, 10) : null;

    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({ detail: 'Could not validate credentials' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ detail: 'Could not validate credentials' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }
}
