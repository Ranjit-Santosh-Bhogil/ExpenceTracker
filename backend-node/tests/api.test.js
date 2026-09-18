import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/db.js';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
let hasDatabase = false;

test('database connectivity', { skip: !hasDatabaseUrl }, async () => {
  await prisma.$queryRaw`SELECT 1`;
  hasDatabase = true;
});

test('health endpoint returns ok', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('auth and CRUD flows', async (t) => {
  if (!hasDatabaseUrl) {
    t.skip('DATABASE_URL is not configured');
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    t.skip('Database is not reachable');
    return;
  }

  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';
  let token;
  let expenseId;

  await t.test('register user', async () => {
    const response = await request(app)
      .post('/register')
      .send({ name: 'Test User', email, password });
    assert.equal(response.status, 201);
    assert.equal(response.body.email, email);
  });

  await t.test('reject duplicate registration', async () => {
    const response = await request(app)
      .post('/register')
      .send({ name: 'Test User', email, password });
    assert.equal(response.status, 400);
    assert.equal(response.body.detail, 'Email already registered');
  });

  await t.test('login user', async () => {
    const response = await request(app).post('/login').send({ email, password });
    assert.equal(response.status, 200);
    assert.ok(response.body.access_token);
    assert.equal(response.body.token_type, 'bearer');
    token = response.body.access_token;
  });

  await t.test('get current user', async () => {
    const response = await request(app).get('/me').set('Authorization', `Bearer ${token}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.email, email);
  });

  await t.test('create expense', async () => {
    const response = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Coffee',
        amount: 5.5,
        category: 'Food',
        description: 'Morning coffee',
      });
    assert.equal(response.status, 201);
    assert.equal(response.body.title, 'Coffee');
    expenseId = response.body.id;
  });

  await t.test('list expenses', async () => {
    const response = await request(app)
      .get('/expenses')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
    assert.ok(response.body.some((item) => item.id === expenseId));
  });

  await t.test('create income', async () => {
    const response = await request(app)
      .post('/income')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Salary', amount: 1000 });
    assert.equal(response.status, 201);
  });

  await t.test('dashboard summary', async () => {
    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.total_income, 1000);
    assert.equal(response.body.total_expense, 5.5);
    assert.equal(response.body.current_balance, 994.5);
    assert.ok(Array.isArray(response.body.recent_expenses));
  });

  await t.test('cleanup created records', async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.expense.deleteMany({ where: { userId: user.id } });
      await prisma.income.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });
});

test.after(async () => {
  await prisma.$disconnect();
});
