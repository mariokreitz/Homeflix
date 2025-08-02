import { RedisStore } from 'connect-redis';
import { getRedisClient, initRedisClient } from '../services/redis.service.js';
import { dbLogger } from '../services/logger.service.js';
import { REDIS_STORE_CONFIG } from '../config/session.config.js';

let redisStore = null;
let storeReady = false;

async function createSessionStore() {
    await initRedisClient();
    const client = getRedisClient();

    if (!client?.isReady) {
        throw new Error('Redis client is not ready');
    }

    return new RedisStore({
        client,
        ...REDIS_STORE_CONFIG,
    });
}

export async function initSessionStore() {
    if (storeReady && redisStore) {
        dbLogger.debug('RedisStore for Sessions already initialized, returning existing store');
        return redisStore;
    }

    try {
        redisStore = await createSessionStore();
        storeReady = true;
        dbLogger.info('RedisStore for Sessions initialized successfully');
        return redisStore;
    } catch (err) {
        dbLogger.error('Error during the initialization of the RedisStore', {
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
