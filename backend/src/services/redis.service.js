import { createClient } from 'redis';
import { REDIS_URL } from '../config/env.config.js';
import { consoleLogger, serverLogger } from './logger.service.js';

let redisClient = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Attaches event handlers to the Redis client.
 */
function handleRedisEvents(client) {
    client.on('error', err => {
        serverLogger.error('Redis client error', { error: err?.message ?? String(err) });
    });
    client.on('reconnecting', () => {
        serverLogger.info('Redis client reconnecting');
        consoleLogger.info('Redis client reconnecting');
    });
    client.on('connect', () => {
        serverLogger.info('Redis client connected');
        consoleLogger.info('Redis client connected');
        connectionAttempts = 0;
    });
}

/**
 * Initializes and connects the Redis client.
 */
export async function initRedisClient() {
    if (redisClient?.isReady) return redisClient;

    if (redisClient) {
        try {
            await redisClient.disconnect();
            redisClient = null;
        } catch {
            // intentionally ignored
        }
    }

    try {
        connectionAttempts++;
        serverLogger.info(`Connecting to Redis (attempt ${connectionAttempts})`);

        redisClient = createClient({
            url: REDIS_URL,
            socket: {
                reconnectStrategy: retries => {
                    if (retries > MAX_RECONNECT_ATTEMPTS) {
                        serverLogger.error('Maximum Redis reconnection attempts reached');
                        return new Error('Maximum Redis reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });

        handleRedisEvents(redisClient);

        await redisClient.connect();
        serverLogger.info('Redis client ready');
        return redisClient;
    } catch (err) {
        serverLogger.error('Redis client connection failed', {
            error: err?.message ?? String(err),
            attempts: connectionAttempts,
        });
        redisClient = null;
        return null;
    }
}

/**
 * Returns the initialized Redis client or throws an error.
 */
export function getRedisClient() {
    if (!redisClient?.isReady) {
        throw new Error('Redis client not initialized or not connected');
    }
    return redisClient;
}

/**
 * Safely closes the Redis client.
 */
export async function closeRedisClient() {
    if (redisClient) {
        try {
            await redisClient.disconnect();
            serverLogger.info('Redis client disconnected');
        } catch (err) {
            serverLogger.error('Error disconnecting Redis client', { error: err?.message ?? String(err) });
        } finally {
            redisClient = null;
        }
    }
}
