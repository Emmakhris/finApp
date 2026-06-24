import express from 'express';
import cors from 'cors';
import { requireApiKey } from './middleware/auth';
import categoriesRouter from './routes/categories';
import transactionsRouter from './routes/transactions';
import receivablesRouter from './routes/receivables';
import payablesRouter from './routes/payables';
import paymentsRouter from './routes/payments';
import loansRouter from './routes/loans';
import loanRepaymentsRouter from './routes/loanRepayments';
import dashboardRouter from './routes/dashboard';
import backupRouter from './routes/backup';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', requireApiKey);
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/receivables', receivablesRouter);
app.use('/api/payables', payablesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/loans', loansRouter);
app.use('/api/loan-repayments', loanRepaymentsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/backup', backupRouter);

export default app;
