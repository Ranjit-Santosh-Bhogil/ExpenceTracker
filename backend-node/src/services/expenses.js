import prisma from '../db.js';

export async function getExpenses(userId, { search, category, sortBy = 'date' } = {}) {
  const where = { userId };

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (category) {
    where.category = category;
  }

  let orderBy;
  if (sortBy === 'amount') {
    orderBy = { amount: 'desc' };
  } else if (sortBy === 'title') {
    orderBy = { title: 'asc' };
  } else {
    orderBy = { date: 'desc' };
  }

  return prisma.expense.findMany({ where, orderBy });
}

export async function getExpenseById(expenseId, userId) {
  return prisma.expense.findFirst({
    where: { id: expenseId, userId },
  });
}

export async function createExpense(userId, data) {
  return prisma.expense.create({
    data: {
      title: data.title,
      amount: data.amount,
      category: data.category,
      description: data.description ?? null,
      date: data.date ?? new Date(),
      userId,
    },
  });
}

export async function updateExpense(expenseId, userId, data) {
  const existing = await getExpenseById(expenseId, userId);
  if (!existing) {
    return null;
  }

  return prisma.expense.update({
    where: { id: expenseId },
    data,
  });
}

export async function deleteExpense(expenseId, userId) {
  const existing = await getExpenseById(expenseId, userId);
  if (!existing) {
    return false;
  }

  await prisma.expense.delete({ where: { id: expenseId } });
  return true;
}
