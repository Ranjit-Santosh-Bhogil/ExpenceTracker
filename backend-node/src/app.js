import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import incomeRoutes from './routes/income.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/income', incomeRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
