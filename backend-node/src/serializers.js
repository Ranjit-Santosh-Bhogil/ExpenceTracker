export function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function serializeExpense(expense) {
  return {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    date: expense.date.toISOString(),
    description: expense.description,
    user_id: expense.userId,
  };
}

export function serializeIncome(income) {
  return {
    id: income.id,
    title: income.title,
    amount: income.amount,
    date: income.date.toISOString(),
    user_id: income.userId,
  };
}
