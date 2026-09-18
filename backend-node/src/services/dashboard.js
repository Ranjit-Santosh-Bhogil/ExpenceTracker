import prisma from '../db.js';

export async function getDashboardSummary(userId) {
  const [incomeAggregate, expenseAggregate, recentExpenses] = await Promise.all([
    prisma.income.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ]);

  const totalIncome = incomeAggregate._sum.amount ?? 0;
  const totalExpense = expenseAggregate._sum.amount ?? 0;

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    current_balance: totalIncome - totalExpense,
    recent_expenses: recentExpenses,
  };
}
