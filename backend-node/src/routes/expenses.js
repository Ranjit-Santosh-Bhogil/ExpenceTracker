import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { expenseCreateSchema, expenseUpdateSchema } from '../schemas/index.js';
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from '../services/expenses.js';
import { serializeExpense } from '../serializers.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(expenseCreateSchema), async (req, res, next) => {
  try {
    const expense = await createExpense(req.user.id, req.body);
    return res.status(201).json(serializeExpense(expense));
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const expenses = await getExpenses(req.user.id, {
      search: req.query.search || undefined,
      category: req.query.category || undefined,
      sortBy: req.query.sort_by || 'date',
    });
    return res.json(expenses.map(serializeExpense));
  } catch (error) {
    next(error);
  }
});

router.put('/:expenseId', validateBody(expenseUpdateSchema), async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.expenseId, 10);
    const updated = await updateExpense(expenseId, req.user.id, req.body);

    if (!updated) {
      return res.status(404).json({ detail: 'Expense not found' });
    }

    return res.json(serializeExpense(updated));
  } catch (error) {
    next(error);
  }
});

router.delete('/:expenseId', async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.expenseId, 10);
    const success = await deleteExpense(expenseId, req.user.id);

    if (!success) {
      return res.status(404).json({ detail: 'Expense not found' });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
