import { getSessionStore } from '../middlewares/session.middleware.js';
import { dbLogger } from './logger.service.js';

export class SessionService {
    /**
     * Session-data with Token information synchronization
     */
    static async linkSessionWithTokens(sessionId, userId, tokenData) {
        try {
            const store = getSessionStore();
            return new Promise((resolve, reject) => {
                store.get(sessionId, (err, session) => {
                    if (err) return reject(err);

                    if (!session) {
                        session = {};
                    }

                    // Session mit Token-Informationen verknüpfen
                    session.userId = userId;
                    session.tokenId = tokenData.id;
                    session.lastActivity = new Date().toISOString();

                    store.set(sessionId, session, (err) => {
                        if (err) return reject(err);
                        resolve(true);
                    });
                });
            });
        } catch (err) {
            dbLogger.error('Error linking session with tokens', {
                error: err?.message,
                sessionId,
                userId,
            });
            throw err;
        }
    }

    /**
     * Session invalidieren
     */
    static async invalidateSession(sessionId) {
        try {
            const store = getSessionStore();
            return new Promise((resolve) => {
                store.destroy(sessionId, () => {
                    resolve(true);
                });
            });
        } catch (err) {
            dbLogger.error('Error invalidating the session', {
                error: err?.message,
                sessionId,
            });
        }
    }
}