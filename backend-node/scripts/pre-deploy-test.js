#!/usr/bin/env node
/**
 * Pre-deploy verification — run before deploying Node backend.
 *
 * Usage:
 *   Terminal 1: cd backend-node && npm start
 *   Terminal 2: cd frontend && npm run dev
 *   Terminal 3: cd backend-node && node scripts/pre-deploy-test.js
 */
import { spawn } from 'node:child_process';
import axios from 'axios';

const API = process.env.API_BASE || 'http://127.0.0.1:3000';
const PROXY = process.env.PROXY_BASE || 'http://127.0.0.1:5173/api';

function log(icon, msg) {
  console.log(`${icon}  ${msg}`);
}

async function check(name, fn) {
  try {
    await fn();
    log('✅', name);
    return true;
  } catch (err) {
    log('❌', `${name} — ${err.response?.data?.detail || err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n=== Expense Tracker Pre-Deploy Test ===\n');
  let passed = 0;
  let failed = 0;

  const results = [];

  results.push(await check('Backend health', async () => {
    const res = await axios.get(`${API}/health`, { timeout: 5000 });
    if (res.data.status !== 'ok') throw new Error('Unexpected health response');
  }));

  results.push(await check('Vite proxy health', async () => {
    const res = await axios.get(`${PROXY}/health`, { timeout: 5000 });
    if (res.data.status !== 'ok') throw new Error('Proxy not forwarding to backend');
  }));

  const email = `deploy-test-${Date.now()}@example.com`;
  const password = 'password123';
  let token;

  results.push(await check('POST /register', async () => {
    const res = await axios.post(`${PROXY}/register`, { name: 'Deploy Test', email, password });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
  }));

  results.push(await check('POST /login', async () => {
    const res = await axios.post(`${PROXY}/login`, { email, password });
    token = res.data.access_token;
    if (!token) throw new Error('No access_token');
  }));

  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const date = new Date().toISOString().split('T')[0];
  const isoDate = new Date(`${date}T00:00:00`).toISOString();

  results.push(await check('GET /me (Profile)', async () => {
    const res = await axios.get(`${PROXY}/me`, auth);
    if (res.data.email !== email) throw new Error('Wrong user returned');
  }));

  let expenseId;
  results.push(await check('POST /expenses', async () => {
    const res = await axios.post(`${PROXY}/expenses`, {
      title: 'Test Expense', amount: 100, category: 'Food', date: isoDate,
    }, auth);
    expenseId = res.data.id;
    if (!res.data.user_id) throw new Error('Missing user_id in response');
  }));

  results.push(await check('GET /expenses', async () => {
    const res = await axios.get(`${PROXY}/expenses`, auth);
    if (!Array.isArray(res.data)) throw new Error('Expected array');
  }));

  results.push(await check('PUT /expenses/:id', async () => {
    await axios.put(`${PROXY}/expenses/${expenseId}`, {
      title: 'Updated', amount: 150, category: 'Food', date: isoDate,
    }, auth);
  }));

  let incomeId;
  results.push(await check('POST /income', async () => {
    const res = await axios.post(`${PROXY}/income`, {
      title: 'Test Income', amount: 1000, date: isoDate,
    }, auth);
    incomeId = res.data.id;
  }));

  results.push(await check('GET /income', async () => {
    const res = await axios.get(`${PROXY}/income`, auth);
    if (!Array.isArray(res.data)) throw new Error('Expected array');
  }));

  results.push(await check('PUT /income/:id', async () => {
    await axios.put(`${PROXY}/income/${incomeId}`, {
      title: 'Updated Income', amount: 2000, date: isoDate,
    }, auth);
  }));

  results.push(await check('GET /dashboard', async () => {
    const res = await axios.get(`${PROXY}/dashboard`, auth);
    if (typeof res.data.total_income !== 'number') throw new Error('Missing total_income');
    if (!Array.isArray(res.data.recent_expenses)) throw new Error('Missing recent_expenses');
  }));

  results.push(await check('DELETE /expenses/:id', async () => {
    await axios.delete(`${PROXY}/expenses/${expenseId}`, auth);
  }));

  results.push(await check('DELETE /income/:id', async () => {
    await axios.delete(`${PROXY}/income/${incomeId}`, auth);
  }));

  // Run automated test suite
  results.push(await new Promise((resolve) => {
    const child = spawn('npm', ['test'], { shell: true, stdio: 'inherit' });
    child.on('close', (code) => resolve(code === 0));
  }).then((ok) => {
    if (ok) { log('✅', 'Automated test suite (npm test)'); return true; }
    log('❌', 'Automated test suite (npm test)'); return false;
  }));

  passed = results.filter(Boolean).length;
  failed = results.filter((r) => !r).length;

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

  if (failed === 0) {
    console.log('Ready to deploy! Update frontend VITE_API_URL to your Node backend URL.\n');
    process.exit(0);
  } else {
    console.log('Fix failing checks before deploying.\n');
    process.exit(1);
  }
}

main();
