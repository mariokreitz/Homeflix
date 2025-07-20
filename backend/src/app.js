import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { devRequestLogger, requestLogger } from './middlewares/requestLogger.middleware.js';
import session from 'express-session';
import { getSessionStore, initSessionStore } from './middlewares/session.middleware.js';
import { CORS_ORIGIN, isProduction, SESSION_SECRET } from './config/env.config.js';
import { connectPrisma } from './services/prisma.service.js';

const app = express();
const allowedOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());


app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204,
}));
app.use((req, res, next) => {
    if (isProduction && req.headers['x-forwarded-proto'] !== 'https') {
        return res.status(403).json({
            success: false,
            error: {
                code: 'HTTPS_REQUIRED',
                message: 'HTTPS-Verbindung erforderlich',
                details: {},
            },
        });
    }
    next();
});

app.use(requestLogger);
app.use(devRequestLogger);

await connectPrisma();
await initSessionStore();
app.use(
    session({
        store: getSessionStore(),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    }),
);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: { message: 'API is up and running' },
        meta: { uptime: process.uptime() },
    });
});

export default app;