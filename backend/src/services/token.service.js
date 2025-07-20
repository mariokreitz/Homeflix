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

export async function generateTokens(userId) {
    if (!userId) {
        return Promise.reject(createHttpError('INVALID_USER_ID', 'User ID is required', 400));
    }

    try {
        const sessionId = uuidv4();
        const accessToken = jwt.sign({ userId, sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign({ userId, sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
        const csrfToken = uuidv4();

        const redis = getRedisClient();
        const sessionData = JSON.stringify({ userId, refreshToken, csrfToken, createdAt: Date.now() });

        await redis.set(
            `${SESSION_PREFIX}${sessionId}`,
            sessionData,
            { EX: parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY) },
        );

        serverLogger.info('Tokens generated successfully', { userId, sessionId });
        return { accessToken, refreshToken, csrfToken, sessionId };
    } catch (error) {
        serverLogger.error('Error generating tokens', { userId, error: error.message });
        return Promise.reject(createHttpError('TOKEN_GENERATION_FAILED', 'Token generation failed', 500, { userId }));
    }
}

async function getAndValidateSession(sessionId, userId) {
    const redis = getRedisClient();
    const session = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    if (!session) {
        serverLogger.warn('Session not found', { sessionId, userId });
        throw createHttpError('SESSION_NOT_FOUND', 'Session not found', 401);
    }
    return JSON.parse(session);
}

export async function validateAccessToken(token) {
    if (!token) {
        return Promise.reject(createHttpError('TOKEN_MISSING', 'Access token is missing', 401));
    }

    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);

        if (!payload.sessionId || !payload.userId) {
            return Promise.reject(createHttpError('TOKEN_PAYLOAD_INVALID', 'Token payload invalid', 401));
        }

        await getAndValidateSession(payload.sessionId, payload.userId);

        return payload;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            serverLogger.info('Access token expired', { error: error.message });
            return Promise.reject(createHttpError('ACCESS_TOKEN_EXPIRED', 'Access token expired', 401));
        }
        if (error.name === 'JsonWebTokenError') {
            serverLogger.warn('Access token malformed', { error: error.message });
            return Promise.reject(createHttpError('ACCESS_TOKEN_MALFORMED', 'Access token malformed', 401));
        }
        serverLogger.error('Unexpected error during access token validation', {
            error: error.message,
            stack: error.stack,
        });
        return Promise.reject(createHttpError('ACCESS_TOKEN_VALIDATION_FAILED', 'Access token validation failed', 500));
    }
}

export async function validateRefreshToken(token) {
    if (!token) {
        return Promise.reject(createHttpError('TOKEN_MISSING', 'Refresh token is missing', 401));
    }

    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);

        if (!payload.sessionId || !payload.userId) {
            return Promise.reject(createHttpError('TOKEN_PAYLOAD_INVALID', 'Token payload invalid', 401));
        }

        const sessionData = await getAndValidateSession(payload.sessionId, payload.userId);
        if (sessionData.refreshToken !== token) {
            serverLogger.warn('Refresh token mismatch', {
                sessionId: payload.sessionId,
                userId: payload.userId,
            });
            return Promise.reject(createHttpError('REFRESH_TOKEN_MISMATCH', 'Refresh token mismatch', 401, { sessionId: payload.sessionId }));
        }

        return payload;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            serverLogger.info('Refresh token expired', { error: error.message });
            return Promise.reject(createHttpError('REFRESH_TOKEN_EXPIRED', 'Refresh token expired', 401));
        }
        if (error.name === 'JsonWebTokenError') {
            serverLogger.warn('Refresh token malformed', { error: error.message });
            return Promise.reject(createHttpError('REFRESH_TOKEN_MALFORMED', 'Refresh token malformed', 401));
        }
        serverLogger.error('Unexpected error during refresh token validation', {
            error: error.message,
            stack: error.stack,
        });
        return Promise.reject(createHttpError('REFRESH_TOKEN_VALIDATION_FAILED', 'Refresh token validation failed', 500));
    }
}

export async function validateCsrfToken(sessionId, csrfToken) {
    if (!sessionId || !csrfToken) {
        return Promise.reject(createHttpError('CSRF_PARAMS_MISSING', 'Session ID or CSRF token is missing', 403));
    }

    try {
        const redis = getRedisClient();
        const session = await redis.get(`${SESSION_PREFIX}${sessionId}`);

        if (!session) {
            serverLogger.warn('Session not found for CSRF validation', { sessionId });
            return Promise.reject(createHttpError('SESSION_NOT_FOUND', 'Session not found', 403));
        }

        const sessionData = JSON.parse(session);
        if (sessionData.csrfToken !== csrfToken) {
            serverLogger.warn('CSRF token mismatch', { sessionId });
            return Promise.reject(createHttpError('CSRF_TOKEN_MISMATCH', 'CSRF token mismatch', 403, { sessionId }));
        }

        return true;
    } catch (error) {
        serverLogger.error('Unexpected error during CSRF validation', {
            sessionId,
            error: error.message,
            stack: error.stack,
        });
        return Promise.reject(createHttpError('CSRF_VALIDATION_FAILED', 'CSRF validation failed', 500, { sessionId }));
    }
}

export async function revokeSession(sessionId) {
    if (!sessionId) {
        return Promise.reject(createHttpError('SESSION_ID_MISSING', 'Session ID is missing', 400));
    }

    try {
        const redis = getRedisClient();
        const result = await redis.del(`${SESSION_PREFIX}${sessionId}`);

        if (result === 0) {
            serverLogger.warn('Attempt to revoke non-existent session', { sessionId });
            return Promise.reject(createHttpError('SESSION_NOT_FOUND', 'Session not found', 404));
        }

        serverLogger.info('Session revoked successfully', { sessionId });
        return true;
    } catch (error) {
        serverLogger.error('Error revoking session', {
            sessionId,
            error: error.message,
            stack: error.stack,
        });
        return Promise.reject(createHttpError('SESSION_REVOCATION_FAILED', 'Session revocation failed', 500, { sessionId }));
    }
}

export async function rotateRefreshToken(oldRefreshToken) {
    try {
        const payload = await validateRefreshToken(oldRefreshToken);
        await revokeSession(payload.sessionId);
        return await generateTokens(payload.userId);
    } catch (error) {
        serverLogger.error('Error rotating refresh token', { error: error.message });
        return Promise.reject(createHttpError('REFRESH_TOKEN_ROTATION_FAILED', 'Refresh token rotation failed', 500));
    }
}

function parseExpiryToSeconds(expiry) {
    if (typeof expiry === 'number') return expiry;

    const match = /^(\d+)([smhd])$/.exec(expiry);
    if (!match) {
        serverLogger.warn('Invalid expiry format, using default value', { expiry });
        return 3600;
    }

    const value = parseInt(match[1], 10);
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };

    return value * (multipliers[match[2]] || 3600);
}

// Export all functions as an object for compatibility
export const TokenService = {
    generateTokens,
    validateAccessToken,
    validateRefreshToken,
    validateCsrfToken,
    revokeSession,
    rotateRefreshToken,
};
