import { SessionService } from '../services/session.service.js';
import { serverLogger } from '../services/logger.service.js';

const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_INACTIVITY_TIME = 24 * 60 * 60 * 1000; // 24 hours


export function startSessionCleanupJob() {
    serverLogger.info('Starting session cleanup job', {
        interval: `${CLEANUP_INTERVAL / 1000 / 60} minutes`,
        maxInactivity: `${MAX_INACTIVITY_TIME / 1000 / 60 / 60} hours`,
    });

    cleanupSessions();

    setInterval(cleanupSessions, CLEANUP_INTERVAL);
}

async function cleanupSessions() {
    try {
        const count = await SessionService.cleanupExpiredSessions(MAX_INACTIVITY_TIME);
        if (count > 0) {
            serverLogger.info(`Cleaned up ${count} expired sessions`);
        }
    } catch (err) {
        serverLogger.error('Error cleaning up sessions', {
            error: err.message,
            stack: err.stack,
        });
    }
}