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

async function getSession(sessionId) {
    const redis = getRedisClient();
    const sessionRaw = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    if (!sessionRaw) throw createHttpError('SESSION_NOT_FOUND', 'Session not found', 401);
    return JSON.parse(sessionRaw);
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
    return { accessToken, refreshToken, csrfToken, sessionId };
}

async function validateAccessToken(token) {
    if (!token) throw createHttpError('TOKEN_MISSING', 'Access token is missing', 401);
    const payload = verifyJwt(token, ACCESS_TOKEN_SECRET, 'ACCESS');
    if (!payload.sessionId || !payload.userId) throw createHttpError('TOKEN_PAYLOAD_INVALID', 'Token payload invalid', 401);
    await getSession(payload.sessionId);
    return payload;
}

async function validateRefreshToken(token) {
    if (!token) throw createHttpError('TOKEN_MISSING', 'Refresh token is missing', 401);
    const payload = verifyJwt(token, REFRESH_TOKEN_SECRET, 'REFRESH');
    if (!payload.sessionId || !payload.userId) throw createHttpError('TOKEN_PAYLOAD_INVALID', 'Token payload invalid', 401);
    const session = await getSession(payload.sessionId);
    if (session.refreshToken !== token) throw createHttpError('REFRESH_TOKEN_MISMATCH', 'Refresh token mismatch', 401, { sessionId: payload.sessionId });
    return payload;
}

async function validateCsrfToken(sessionId, csrfToken) {
    if (!sessionId || !csrfToken) throw createHttpError('CSRF_PARAMS_MISSING', 'Session ID or CSRF token is missing', 403);
    const session = await getSession(sessionId);
    if (session.csrfToken !== csrfToken) throw createHttpError('CSRF_TOKEN_MISMATCH', 'CSRF token mismatch', 403, { sessionId });
    return true;
}

async function revokeSession(sessionId) {
    if (!sessionId) throw createHttpError('SESSION_ID_MISSING', 'Session ID is missing', 400);
    const redis = getRedisClient();
    const result = await redis.del(`${SESSION_PREFIX}${sessionId}`);
    if (result === 0) throw createHttpError('SESSION_NOT_FOUND', 'Session not found', 404);
    serverLogger.info('Session revoked', { sessionId });
    return true;
}

async function rotateRefreshToken(oldRefreshToken) {
    const payload = await validateRefreshToken(oldRefreshToken);
    await revokeSession(payload.sessionId);
    return await generateTokens(payload.userId);
}

async function invalidateSession(sessionId) {
    if (!sessionId) throw createHttpError('SESSION_ID_MISSING', 'Session ID is missing', 400);
    const redis = getRedisClient();
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
}

async function refreshAccessToken(refreshToken) {
    const payload = await validateRefreshToken(refreshToken);
    const session = await getSession(payload.sessionId);
    if (session.refreshToken !== refreshToken) throw createHttpError('INVALID_REFRESH_TOKEN', 'Refresh token does not match session', 401);
    const accessToken = jwt.sign({
        userId: payload.userId,
        sessionId: payload.sessionId,
    }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    session.refreshToken = jwt.sign({
        userId: payload.userId,
        sessionId: payload.sessionId,
    }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    const redis = getRedisClient();
    await redis.set(`${SESSION_PREFIX}${payload.sessionId}`, JSON.stringify(session), { EX: parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY) });
    return { accessToken, csrfToken: session.csrfToken, sessionId: payload.sessionId };
}

async function getCsrfToken(sessionId) {
    const session = await getSession(sessionId);
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
    invalidateSession,
    refreshAccessToken,
    revokeSession,
    rotateRefreshToken,
    getCsrfToken,
};
