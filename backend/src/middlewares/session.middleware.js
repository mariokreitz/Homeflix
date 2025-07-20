import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { REDIS_URL } from '../config/env.config.js';
import { dbLogger } from '../services/logger.service.js';

let redisClient;
let redisStore;
let storeReady = false;

export async function initSessionStore() {
    try {
        redisClient = createClient({ url: REDIS_URL });
        await redisClient.connect();
        dbLogger.info('Redis client connected successfully');
        redisStore = new RedisStore({
            client: redisClient,
            prefix: 'homeflix:',
        });
        storeReady = true;
    } catch (err) {
        dbLogger.error('Redis connection/init error', { error: err?.message ?? err });
        redisStore = null;
        storeReady = false;
    }
}

export function getSessionStore() {
    if (!storeReady || !redisStore) {
        dbLogger.error('RedisStore is not initialized');
        throw new Error('RedisStore is not initialized');
    }
    return redisStore;
}