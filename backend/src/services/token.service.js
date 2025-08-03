import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from './redis.service.js';
import { serverLogger } from './logger.service.js';
import {
    ACCESS_TOKEN_EXPIRY,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    SESSION_PREFIX,
} from '../config/env.config.js';
import { createHttpError } from '../middlewares/errorHandler.middleware.js';
import { SessionService } from './session.service.js';

async function getTokenSession(sessionId, createIfNotExists = false) {
    try {
        const redis = getRedisClient();
        const sessionKey = `${SESSION_PREFIX}${sessionId}`;
        const sessionRaw = await redis.get(sessionKey);

        if (!sessionRaw) {
            if (createIfNotExists) {
                return {};
            }
            throw createHttpError('SESSION_NOT_FOUND', 'Session nicht gefunden', 401);
        }

        const redisSession = JSON.parse(sessionRaw);

        let expressSession = null;
        try {
            expressSession = await SessionService.getSessionData(sessionId);
        } catch (err) {
            serverLogger.warn('Express Session konnte nicht abgerufen werden', {
                sessionId,
                error: err?.message,
            });
        }

        // Daten aus beiden Quellen zusammenführen, wobei Redis-Daten Priorität haben
        const mergedSession = {
            ...(expressSession || {}),
            ...redisSession,
        };

        if (!mergedSession.csrfToken) {
            serverLogger.warn('CSRF-Token fehlt in der Session', { sessionId });
        }

        return mergedSession;
    } catch (err) {
        if (err.statusCode === 401) {
            throw err; // Re-throw HTTP errors
        }
        serverLogger.error('Fehler beim Abrufen der Token-Session', {
            error: err?.message,
            sessionId,
        });
        throw createHttpError('SESSION_ERROR', 'Fehler beim Abrufen der Session', 500);
    }
}

function verifyJwt(token, secret, type) {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        const code = `${type}_TOKEN_${error.name === 'TokenExpiredError' ? 'EXPIRED' : error.name === 'JsonWebTokenError' ? 'MALFORMED' : 'VALIDATION_FAILED'}`;
        const msg = `${type} token ${error.name === 'TokenExpiredError' ? 'expired' : error.name === 'JsonWebTokenError' ? 'malformed' : 'validation failed'}`;
        serverLogger[error.name === 'TokenExpiredError' ? 'info' : error.name === 'JsonWebTokenError' ? 'warn' : 'error'](msg, { error: error.message });
        throw createHttpError(code, msg, 401);
    }
}

async function generateTokens(userId) {
    if (!userId) throw createHttpError('INVALID_USER_ID', 'User ID is required', 400);
    const sessionId = uuidv4();
    const accessToken = jwt.sign({ userId, sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId, sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    const csrfToken = uuidv4();
    const redis = getRedisClient();
    await redis.set(
        `${SESSION_PREFIX}${sessionId}`,
        JSON.stringify({ userId, refreshToken, csrfToken, createdAt: Date.now() }),
        { EX: parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY) },
    );
    serverLogger.info('Tokens generated', { userId, sessionId });
    return { accessToken, refreshToken, csrfToken, sessionId, id: sessionId };
}

async function validateAccessToken(token) {
    if (!token) throw createHttpError('TOKEN_MISSING', 'Access token is missing', 401);
    const payload = verifyJwt(token, ACCESS_TOKEN_SECRET, 'ACCESS');
    if (!payload.sessionId || !payload.userId) throw createHttpError('TOKEN_PAYLOAD_INVALID', 'Token payload invalid', 401);
    await getTokenSession(payload.sessionId, false);
    return payload;
}

async function validateRefreshToken(token) {
    if (!token) throw createHttpError('TOKEN_MISSING', 'Refresh token is missing', 401);
    const payload = verifyJwt(token, REFRESH_TOKEN_SECRET, 'REFRESH');
    if (!payload.sessionId || !payload.userId) throw createHttpError('TOKEN_PAYLOAD_INVALID', 'Token payload invalid', 401);
    const session = await getTokenSession(payload.sessionId);
    if (session.refreshToken !== token) throw createHttpError('REFRESH_TOKEN_MISMATCH', 'Refresh token mismatch', 401, { sessionId: payload.sessionId });
    return payload;
}

async function validateCsrfToken(sessionId, csrfToken) {
    if (!sessionId || !csrfToken) throw createHttpError('CSRF_PARAMS_MISSING', 'Session ID or CSRF token is missing', 403);
    const session = await getTokenSession(sessionId);
    console.log('Validating CSRF token for session', session, 'with token', csrfToken);
    if (session.csrfToken !== csrfToken) throw createHttpError('CSRF_TOKEN_MISMATCH', 'CSRF token mismatch', 403, { sessionId });
    return true;
}

async function refreshAccessToken(refreshToken) {
    const payload = await validateRefreshToken(refreshToken);
    const session = await getTokenSession(payload.sessionId);

    if (session.refreshToken !== refreshToken)
        throw createHttpError('INVALID_REFRESH_TOKEN', 'Refresh token does not match session', 401);

    const accessToken = jwt.sign({
        userId: payload.userId,
        sessionId: payload.sessionId,
    }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

    const newRefreshToken = jwt.sign({
        userId: payload.userId,
        sessionId: payload.sessionId,
    }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    session.refreshToken = newRefreshToken;

    const redis = getRedisClient();
    await redis.set(
        `${SESSION_PREFIX}${payload.sessionId}`,
        JSON.stringify(session),
        { EX: parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY) },
    );

    return {
        accessToken,
        refreshToken: newRefreshToken,
        csrfToken: session.csrfToken,
        sessionId: payload.sessionId,
    };
}

async function getCsrfToken(sessionId) {
    const session = await getTokenSession(sessionId);
    return { csrfToken: session.csrfToken };
}

function parseExpiryToSeconds(expiry) {
    if (typeof expiry === 'number') return expiry;
    const match = /^(\d+)([smhd])$/.exec(expiry);
    if (!match) return 3600;
    const value = parseInt(match[1], 10);
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[match[2]] || 3600);
}

export const TokenService = {
    generateTokens,
    validateAccessToken,
    validateCsrfToken,
    refreshAccessToken,
    getCsrfToken,
    getTokenSession,
    invalidateSession: SessionService.invalidateSession,
};