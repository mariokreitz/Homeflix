import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, initRedisClient } from '../services/redis.service.js';
import { serverLogger } from '../services/logger.service.js';
import { isProduction } from '../config/env.config.js';

/**
 * Returns a Redis-backed rate limit store if available.
 */
async function getRateLimitStore() {
    try {
        await initRedisClient();
        const redisClient = getRedisClient();
        if (redisClient?.isReady) {
            serverLogger.info('Rate limiter using Redis store');
            return new RedisStore({
                sendCommand: (...args) => redisClient.sendCommand(args),
                prefix: 'rate-limit:',
                expiry: 15 * 60,
            });
        }
    } catch (err) {
        serverLogger.error('RateLimit Redis client unavailable, fallback to MemoryStore', {
            error: err?.message ?? String(err),
            stack: isProduction ? undefined : err?.stack,
        });
    }
    return undefined;
}

/**
 * Handles rate limit exceeded responses and logging.
 */
function rateLimitHandler(req, res) {
    res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        details: {
            retryAfter: res.getHeader('Retry-After') || '15 minutes',
        },
    });
    serverLogger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
    });
}

/**
 * Creates the API rate limiter middleware.
 */
export async function createApiRateLimiter() {
    const store = await getRateLimitStore();
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: isProduction ? 100 : 1000,
        standardHeaders: true,
        legacyHeaders: false,
        store,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        handler: rateLimitHandler,
        skip: req => req.path.startsWith('/api-docs'),
    });
}