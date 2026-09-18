import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboardSummary } from '../services/dashboard.js';
import { serializeExpense } from '../serializers.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user.id);
    return res.json({
      total_income: summary.total_income,
      total_expense: summary.total_expense,
      current_balance: summary.current_balance,
      recent_expenses: summary.recent_expenses.map(serializeExpense),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
