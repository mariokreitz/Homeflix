import express from 'express';
import { devRequestLogger, requestLogger } from './middlewares/requestLogger.middleware.js';
import session from 'express-session';
import { getSessionStore, initSessionStore } from './middlewares/session.middleware.js';
import { isProduction, SESSION_SECRET } from './config/env.config.js';

const app = express();


app.use(requestLogger);
app.use(devRequestLogger);


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
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 Woche
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
