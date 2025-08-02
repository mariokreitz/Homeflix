import { isProduction, SESSION_PREFIX, SESSION_SECRET } from './env.config.js';

export const SESSION_CONFIG = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'homeflix.sid',
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Tage
        path: '/',
    },
    rolling: true,
};

export const REDIS_STORE_CONFIG = {
    prefix: SESSION_PREFIX || 'homeflix:session:',
    ttl: 86400, // 1 day in seconds
    disableTouch: false,
    scanCount: 100,
};