/**
 * Mirrors every API call in frontend/src/services/api.js
 * using the same request shapes the React app sends.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import axios from 'axios';
import app from '../src/app.js';
import prisma from '../src/db.js';

const PROXY_BASE = process.env.PROXY_BASE || 'http://127.0.0.1:5173/api';

function frontendExpensePayload(overrides = {}) {
  const date = new Date().toISOString().split('T')[0];
  return {
    title: 'Grocery Shopping',
    amount: 250.75,
    category: 'Food',
    description: 'Weekly groceries',
    date: new Date(`${date}T00:00:00`).toISOString(),
    ...overrides,
  };
}

function frontendIncomePayload(overrides = {}) {
  const date = new Date().toISOString().split('T')[0];
  return {
    title: 'Salary',
    amount: 5000,
    date: new Date(`${date}T00:00:00`).toISOString(),
    ...overrides,
  };
}

async function runDirectFrontendSuite(t, label) {
  const email = `frontend-e2e-${Date.now()}@example.com`;
  const password = 'password123';
  let token;
  let expenseId;
  let incomeId;

  await t.test(`${label}: POST /register`, async () => {
    const res = await request(app)
      .post('/register')
      .send({ name: 'E2E User', email, password });
    assert.equal(res.status, 201);
    assert.ok(res.body.id);
    assert.equal(res.body.email, email);
    assert.equal(res.body.hashed_password, undefined);
  });

  await t.test(`${label}: POST /login`, async () => {
    const res = await request(app).post('/login').send({ email, password });
    assert.equal(res.status, 200);
    assert.ok(res.body.access_token);
    assert.equal(res.body.token_type, 'bearer');
    token = res.body.access_token;
  });

  await t.test(`${label}: GET /me (Profile page)`, async () => {
    const res = await request(app).get('/me').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.email, email);
  });

  await t.test(`${label}: POST /expenses`, async () => {
    const res = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send(frontendExpensePayload());
    assert.equal(res.status, 201);
    assert.ok(res.body.user_id);
    expenseId = res.body.id;
  });

  await t.test(`${label}: GET /expenses`, async () => {
    const res = await request(app)
      .get('/expenses')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.some((e) => e.id === expenseId));
  });

  await t.test(`${label}: PUT /expenses/:id`, async () => {
    const res = await request(app)
      .put(`/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Grocery',
        amount: 300,
        category: 'Food',
        description: 'Updated',
        date: frontendExpensePayload().date,
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.amount, 300);
  });

  await t.test(`${label}: POST /income`, async () => {
    const res = await request(app)
      .post('/income')
      .set('Authorization', `Bearer ${token}`)
      .send(frontendIncomePayload());
    assert.equal(res.status, 201);
    incomeId = res.body.id;
  });

  await t.test(`${label}: GET /income`, async () => {
    const res = await request(app)
      .get('/income')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.some((i) => i.id === incomeId));
  });

  await t.test(`${label}: PUT /income/:id`, async () => {
    const res = await request(app)
      .put(`/income/${incomeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Salary',
        amount: 5500,
        date: frontendIncomePayload().date,
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.amount, 5500);
  });

  await t.test(`${label}: GET /dashboard`, async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.total_income, 5500);
    assert.equal(res.body.total_expense, 300);
    assert.equal(res.body.current_balance, 5200);
    assert.ok(Array.isArray(res.body.recent_expenses));
  });

  await t.test(`${label}: DELETE /expenses/:id`, async () => {
    const res = await request(app)
      .delete(`/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 204);
  });

  await t.test(`${label}: DELETE /income/:id`, async () => {
    const res = await request(app)
      .delete(`/income/${incomeId}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 204);
  });

  await t.test(`${label}: GET /me without token → 401`, async () => {
    const res = await request(app).get('/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.detail, 'Could not validate credentials');
  });

  await t.test(`${label}: cleanup`, async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.expense.deleteMany({ where: { userId: user.id } });
      await prisma.income.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });
}

async function runProxyFrontendSuite(t, label) {
  const email = `proxy-e2e-${Date.now()}@example.com`;
  const password = 'password123';
  let token;
  let expenseId;
  let incomeId;

  const headers = () => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  await t.test(`${label}: POST /register via proxy`, async () => {
    const res = await axios.post(`${PROXY_BASE}/register`, { name: 'Proxy User', email, password }, { headers: headers() });
    assert.equal(res.status, 201);
    assert.equal(res.data.email, email);
  });

  await t.test(`${label}: POST /login via proxy`, async () => {
    const res = await axios.post(`${PROXY_BASE}/login`, { email, password }, { headers: headers() });
    assert.equal(res.status, 200);
    token = res.data.access_token;
  });

  await t.test(`${label}: GET /me via proxy`, async () => {
    const res = await axios.get(`${PROXY_BASE}/me`, { headers: headers() });
    assert.equal(res.status, 200);
  });

  await t.test(`${label}: expense CRUD via proxy`, async () => {
    const created = await axios.post(`${PROXY_BASE}/expenses`, frontendExpensePayload(), { headers: headers() });
    assert.equal(created.status, 201);
    expenseId = created.data.id;

    const listed = await axios.get(`${PROXY_BASE}/expenses`, { headers: headers() });
    assert.ok(listed.data.some((e) => e.id === expenseId));

    const updated = await axios.put(`${PROXY_BASE}/expenses/${expenseId}`, {
      title: 'Proxy Updated',
      amount: 99,
      category: 'Food',
      date: frontendExpensePayload().date,
    }, { headers: headers() });
    assert.equal(updated.status, 200);

    const deleted = await axios.delete(`${PROXY_BASE}/expenses/${expenseId}`, { headers: headers() });
    assert.equal(deleted.status, 204);
  });

  await t.test(`${label}: income CRUD via proxy`, async () => {
    const created = await axios.post(`${PROXY_BASE}/income`, frontendIncomePayload(), { headers: headers() });
    assert.equal(created.status, 201);
    incomeId = created.data.id;

    const listed = await axios.get(`${PROXY_BASE}/income`, { headers: headers() });
    assert.ok(listed.data.some((i) => i.id === incomeId));

    const updated = await axios.put(`${PROXY_BASE}/income/${incomeId}`, {
      title: 'Proxy Salary',
      amount: 4000,
      date: frontendIncomePayload().date,
    }, { headers: headers() });
    assert.equal(updated.status, 200);

    const deleted = await axios.delete(`${PROXY_BASE}/income/${incomeId}`, { headers: headers() });
    assert.equal(deleted.status, 204);
  });

  await t.test(`${label}: GET /dashboard via proxy`, async () => {
    const res = await axios.get(`${PROXY_BASE}/dashboard`, { headers: headers() });
    assert.equal(res.status, 200);
    assert.ok(typeof res.data.total_income === 'number');
  });

  await t.test(`${label}: cleanup`, async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.expense.deleteMany({ where: { userId: user.id } });
      await prisma.income.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });
}

test('Direct API — all frontend endpoints', async (t) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    t.skip('Database is not reachable — wake your Neon DB and retry');
    return;
  }
  await runDirectFrontendSuite(t, 'Direct');
});

test('Vite proxy (/api) — all frontend endpoints', async (t) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    t.skip('Database is not reachable');
    return;
  }

  try {
    await axios.get(`${PROXY_BASE}/health`, { timeout: 5000 });
  } catch {
    t.skip(`Start frontend with: cd frontend && npm run dev (proxy at ${PROXY_BASE})`);
    return;
  }

  await runProxyFrontendSuite(t, 'Proxy');
});

test.after(async () => {
  await prisma.$disconnect();
});
