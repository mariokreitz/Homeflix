import { RedisStore } from 'connect-redis';
import { getRedisClient, initRedisClient } from '../services/redis.service.js';
import { dbLogger } from '../services/logger.service.js';
import { SESSION_PREFIX } from '../config/env.config.js';

let redisStore = null;
let storeReady = false;

/**
 * Creates a new RedisStore instance for session management.
 */
async function createSessionStore() {
    await initRedisClient();
    const client = getRedisClient();

    if (!client?.isReady) {
        throw new Error('Redis client is not ready');
    }

    return new RedisStore({
        client,
        prefix: SESSION_PREFIX || 'homeflix:session:',
        ttl: 86400,
        disableTouch: false,
    });
}

/**
 * Initializes the session store with Redis.
 */
export async function initSessionStore() {
    if (storeReady && redisStore) {
        dbLogger.info('Session store already initialized');
        return redisStore;
    }

    try {
        redisStore = await createSessionStore();
        storeReady = true;
        dbLogger.info('RedisStore for session successfully initialized');
        return redisStore;
    } catch (err) {
        dbLogger.error('Failed to initialize RedisStore for sessions', {
            error: err?.message ?? String(err),
            stack: err?.stack,
        });
        redisStore = null;
        storeReady = false;
        return null;
    }
}

/**
 * Returns the initialized session store.
 */
export function getSessionStore() {
    if (!storeReady || !redisStore) {
        dbLogger.error('Attempting to use uninitialized RedisStore');
        throw new Error('RedisStore is not initialized. Call initSessionStore() first.');
    }
    return redisStore;
}

/**
 * Checks if the session store is ready.
 */
export function isSessionStoreReady() {
    return storeReady && redisStore !== null;
}
