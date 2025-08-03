import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { devRequestLogger, requestLogger } from './middlewares/requestLogger.middleware.js';
import session from 'express-session';
import { getSessionStore, initSessionStore, isSessionStoreReady } from './middlewares/session.middleware.js';
import { CORS_ORIGIN, isProduction } from './config/env.config.js';
import { connectPrisma } from './services/prisma.service.js';
import { createApiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { setupSwagger } from './config/swagger.config.js';
import { errorHandlerMiddleware } from './middlewares/errorHandler.middleware.js';
import authRouter from './routes/auth.routes.js';
import mediaRouter from './routes/media.routes.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { SESSION_CONFIG } from './config/session.config.js';
import { sessionExpiryMiddleware } from './middlewares/sessionExpiry.middleware.js';
import { startSessionCleanupJob } from './jobs/session-cleanup.job.js';

const app = express();

/**
 * Returns allowed CORS origins as an array.
 */
function getAllowedOrigins() {
    return Array.isArray(CORS_ORIGIN)
        ? CORS_ORIGIN
        : CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean);
}

/**
 * Sets up security-related middleware.
 */
function setupSecurity(app) {
    app.use(helmet());
    app.use(cors({
        origin: getAllowedOrigins(),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        optionsSuccessStatus: 204,
    }));
}

/**
 * Sets up logging middleware.
 */
function setupLogging(app) {
    app.use(requestLogger);
    if (!isProduction) {
        app.use(devRequestLogger);
    }
}

/**
 * Sets up body parsers.
 */
function setupParsers(app) {
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cookieParser());
}

/**
 * Sets up session middleware.
 */
function setupSession(app) {
    if (!isSessionStoreReady()) {
        throw new Error('Session store is not initialized');
    }
    app.use(
        session({
            ...SESSION_CONFIG,
            store: getSessionStore(),
        }),
    );

    app.use('/api/v1/', sessionExpiryMiddleware);
}

/**
 * Sets up health check endpoint.
 */
function setupHealthCheck(app) {
    app.get('/', (req, res) => {
        res.status(200).json({
            success: true,
            data: { message: 'API is up and running' },
            meta: {
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    });
}

/**
 * Sets up 404 not found handler.
 */
function setupNotFoundHandler(app) {
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'RESOURCE_NOT_FOUND',
                message: 'The requested resource was not found',
                details: { path: req.path },
            },
        });
    });
}

/**
 * Initializes the Express app with all middleware and routes.
 */
async function initializeApp() {
    try {
        setupSecurity(app);

        const apiRateLimiter = await createApiRateLimiter();
        app.use(apiRateLimiter);

        setupLogging(app);
        setupParsers(app);

        await connectPrisma();
        await initSessionStore();
        startSessionCleanupJob();
        setupSession(app);

        app.use(passport.initialize());
        app.use(passport.session());

        setupSwagger(app);
        setupHealthCheck(app);


        app.use('/api/v1/media', mediaRouter);
        app.use('/api/v1/auth', authRouter);

        setupNotFoundHandler(app);
        app.use(errorHandlerMiddleware);

        return app;
    } catch (error) {
        console.error('Critical error during app initialization:', error);
        process.exit(1);
    }
}

const appInstance = await initializeApp();
export default appInstance;
