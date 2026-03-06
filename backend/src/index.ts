import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import alertsRouter from './routes/alerts.js';
import compoundsRouter from './routes/compounds.js';
import watchlistRouter from './routes/watchlist.js';
import searchRouter from './routes/search.js';
import updatesRouter from './routes/updates.js';
import settingsRouter from './routes/settings.js';
import adminRouter from './routes/admin.js';
import { startScheduler } from './jobs/fetchScheduler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'jbn-backend', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/alerts', alertsRouter);
app.use('/api/compounds', compoundsRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/search', searchRouter);
app.use('/api/updates', updatesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`JBN Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start the fetch scheduler if enabled
  if (process.env.ENABLE_SCHEDULER !== 'false') {
    const intervalMinutes = parseInt(process.env.FETCH_INTERVAL_MINUTES || '15', 10);
    startScheduler(intervalMinutes);
    logger.info(`Fetch scheduler started (interval: ${intervalMinutes} minutes)`);
  }
});

export default app;
