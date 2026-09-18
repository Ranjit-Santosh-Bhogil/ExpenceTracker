import { Router } from 'express';
import { verifyPassword } from '../auth/password.js';
import { createAccessToken } from '../auth/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { userCreateSchema, userLoginSchema } from '../schemas/index.js';
import { createUser, getUserByEmail } from '../services/users.js';
import { serializeUser } from '../serializers.js';

const router = Router();

router.post('/register', validateBody(userCreateSchema), async (req, res, next) => {
  try {
    const existing = await getUserByEmail(req.body.email);
    if (existing) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const user = await createUser(req.body);
    return res.status(201).json(serializeUser(user));
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateBody(userLoginSchema), async (req, res, next) => {
  try {
    const user = await getUserByEmail(req.body.email);
    if (!user || !verifyPassword(req.body.password, user.hashedPassword)) {
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    const accessToken = createAccessToken(user.id);
    return res.json({ access_token: accessToken, token_type: 'bearer' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  return res.json(serializeUser(req.user));
});

export default router;
