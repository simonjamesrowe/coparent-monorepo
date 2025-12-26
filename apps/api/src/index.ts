/**
 * CoParent API - Main Entry Point
 * Express.js server with Auth0 integration, multi-tenant isolation, and family management
 */

import express from 'express';
import { runMigrations } from './db/migrate';
import logger from './utils/logger';
import { validateJWT } from './middleware/jwt';
import { ensureActiveUser } from './middleware/tenantIsolation';
import { registerLimiter, generalLimiter } from './middleware/rateLimiter';

// Import route handlers
import authRoutes from './routes/auth';
import familyRoutes from './routes/family';
import invitationRoutes from './routes/invitation';

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes

// Auth routes (public register, protected me)
app.post('/api/v1/users/register', registerLimiter, authRoutes);
app.get('/api/v1/users/me', authRoutes);

// Family routes (protected)
app.post('/api/v1/families', familyRoutes);
app.put('/api/v1/families/:family_id/transfer-admin', familyRoutes);

// Invitation routes (mixed auth)
app.post('/api/v1/invitations', invitationRoutes);
app.get('/api/v1/invitations/:token/preview', invitationRoutes);
app.post('/api/v1/invitations/:token/accept', invitationRoutes);
app.post('/api/v1/invitations/:invitation_id/resend', invitationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.statusCode || 500).json({
    error: err.code || 'internal_server_error',
    message: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: 'Endpoint not found',
  });
});

/**
 * Start server
 */
async function startServer() {
  try {
    // Run database migrations
    logger.info('Running database migrations...');
    await runMigrations();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

export default app;
