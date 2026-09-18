import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { incomeCreateSchema, incomeUpdateSchema } from '../schemas/index.js';
import {
  createIncome,
  deleteIncome,
  getIncome,
  updateIncome,
} from '../services/income.js';
import { serializeIncome } from '../serializers.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(incomeCreateSchema), async (req, res, next) => {
  try {
    const income = await createIncome(req.user.id, req.body);
    return res.status(201).json(serializeIncome(income));
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const income = await getIncome(req.user.id);
    return res.json(income.map(serializeIncome));
  } catch (error) {
    next(error);
  }
});

router.put('/:incomeId', validateBody(incomeUpdateSchema), async (req, res, next) => {
  try {
    const incomeId = parseInt(req.params.incomeId, 10);
    const updated = await updateIncome(incomeId, req.user.id, req.body);

    if (!updated) {
      return res.status(404).json({ detail: 'Income not found' });
    }

    return res.json(serializeIncome(updated));
  } catch (error) {
    next(error);
  }
});

router.delete('/:incomeId', async (req, res, next) => {
  try {
    const incomeId = parseInt(req.params.incomeId, 10);
    const success = await deleteIncome(incomeId, req.user.id);

    if (!success) {
      return res.status(404).json({ detail: 'Income not found' });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
