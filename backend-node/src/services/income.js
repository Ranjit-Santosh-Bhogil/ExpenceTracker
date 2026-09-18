import prisma from '../db.js';

export async function getIncome(userId) {
  return prisma.income.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
}

export async function getIncomeById(incomeId, userId) {
  return prisma.income.findFirst({
    where: { id: incomeId, userId },
  });
}

export async function createIncome(userId, data) {
  return prisma.income.create({
    data: {
      title: data.title,
      amount: data.amount,
      date: data.date ?? new Date(),
      userId,
    },
  });
}

export async function updateIncome(incomeId, userId, data) {
  const existing = await getIncomeById(incomeId, userId);
  if (!existing) {
    return null;
  }

  return prisma.income.update({
    where: { id: incomeId },
    data,
  });
}

export async function deleteIncome(incomeId, userId) {
  const existing = await getIncomeById(incomeId, userId);
  if (!existing) {
    return false;
  }

  await prisma.income.delete({ where: { id: incomeId } });
  return true;
}
