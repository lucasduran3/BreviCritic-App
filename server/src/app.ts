import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { AppError } from './shared/errors/AppError.js';

const app: express.Application = express();

const healthRouter = await import('./routes/health.js');

app.use(express.json({ limit: '10kb' }));

app.use(
  cors({
    origin: config.clientUrl,
  }),
);

app.use('/health', healthRouter.default);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ status: 'error', message: err.message });
    }

    console.error('Unexpected error:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  },
);

export default app;
