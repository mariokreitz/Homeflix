import { getSessionStore } from '../middlewares/session.middleware.js';
import { dbLogger } from './logger.service.js';
import { getRedisClient } from './redis.service.js';
import { SESSION_PREFIX } from '../config/env.config.js';

export class SessionService {
    static async linkSessionWithTokens(sessionId, userId, tokenData) {
        try {
            const store = getSessionStore();
            await new Promise((resolve, reject) => {
                store.get(sessionId, (err, session) => {
                    if (err) return reject(err);

                    if (!session) {
                        session = {};
                    }

                    session.userId = userId;
                    session.tokenId = tokenData.id;
                    session.sessionId = tokenData.sessionId;
                    session.csrfToken = tokenData.csrfToken;
                    session.refreshToken = tokenData.refreshToken;
                    session.tokenCreatedAt = Date.now();
                    session.lastActivity = new Date().toISOString();

                    store.set(sessionId, session, (setErr) => {
                        if (setErr) return reject(setErr);
                        resolve(true);
                    });
                });
            });

            const redis = getRedisClient();
            const redisKey = `${SESSION_PREFIX}${sessionId}`;
            const sessionRaw = await redis.get(redisKey);

            const redisSession = sessionRaw ? JSON.parse(sessionRaw) : {};

            redisSession.userId = userId;
            redisSession.tokenId = tokenData.id;
            redisSession.sessionId = tokenData.sessionId;
            redisSession.csrfToken = tokenData.csrfToken;
            redisSession.refreshToken = tokenData.refreshToken;
            redisSession.tokenCreatedAt = Date.now();
            redisSession.lastActivity = new Date().toISOString();

            await redis.set(
                redisKey,
                JSON.stringify(redisSession),
                { KEEPTTL: true },
            );

            dbLogger.info('Session mit Tokens verknüpft', {
                sessionId,
                userId,
                tokenId: tokenData.id,
            });

            return true;
        } catch (err) {
            dbLogger.error('Fehler beim Verknüpfen der Session mit Tokens', {
                error: err?.message,
                sessionId,
                userId,
            });
            throw err;
        }
    }

    static async invalidateSession(sessionId) {
        try {
            const store = getSessionStore();
            const session = await new Promise((resolve, reject) => {
                store.get(sessionId, (err, sessionData) => {
                    if (err) return reject(err);
                    resolve(sessionData);
                });
            });

            if (session?.userId) {
                return await SessionService.invalidateAllUserSessions(session.userId);
            }

            const redis = getRedisClient();
            await Promise.all([
                new Promise((resolve, reject) => {
                    store.destroy(sessionId, (err) => {
                        if (err) return reject(err);
                        resolve(true);
                    });
                }),
                redis.del(`${SESSION_PREFIX}${sessionId}`),
            ]);

            dbLogger.info('Session ungültig gemacht', { sessionId });
            return true;
        } catch (err) {
            dbLogger.error('Fehler beim Invalidieren der Session', {
                error: err?.message,
                sessionId,
            });
            throw err;
        }
    }

    static async invalidateAllUserSessions(userId) {
        try {

            const store = getSessionStore();
            const redis = getRedisClient();

            const sessions = await new Promise((resolve, reject) => {
                store.all((err, allSessions) => {
                    if (err) return reject(err);
                    resolve(allSessions || {});
                });
            });

            const userSessions = [];

            for (const sid in sessions) {
                const session = sessions[sid];
                if (session?.userId === userId) {
                    userSessions.push({
                        id: sid,
                        sessionId: session.sessionId,
                    });
                }
            }

            const promises = userSessions.map(session => {
                return Promise.all([
                    new Promise((resolve, reject) => {
                        store.destroy(session.id, (err) => {
                            if (err) return reject(err);
                            resolve(true);
                        });
                    }),
                    session.sessionId ?
                        redis.del(`${SESSION_PREFIX}${session.sessionId}`) :
                        Promise.resolve(),
                ]);
            });

            await Promise.all(promises.flat());

            dbLogger.info('Alle Sessions des Benutzers ungültig gemacht', {
                userId,
                sessionCount: userSessions.length,
            });

            return true;
        } catch (err) {
            dbLogger.error('Fehler beim Invalidieren aller Benutzer-Sessions', {
                error: err?.message,
                userId,
            });
            throw err;
        }
    }

    static async getSessionData(sessionId) {
        try {
            const store = getSessionStore();
            return new Promise((resolve, reject) => {
                store.get(sessionId, (err, session) => {
                    if (err) return reject(err);
                    resolve(session || null);
                });
            });
        } catch (err) {
            dbLogger.error('Error retrieving session data', {
                error: err?.message,
                sessionId,
            });
            throw err;
        }
    }

    static async updateSessionData(sessionId, updatedData) {
        try {
            const store = getSessionStore();
            return new Promise((resolve, reject) => {
                store.get(sessionId, (err, session) => {
                    if (err) return reject(err);
                    if (!session) return reject(new Error('Session not found'));

                    const updatedSession = {
                        ...session,
                        ...updatedData,
                        lastActivity: new Date().toISOString(),
                    };

                    store.set(sessionId, updatedSession, (err) => {
                        if (err) return reject(err);
                        resolve(true);
                    });
                });
            });
        } catch (err) {
            dbLogger.error('Error updating session data', {
                error: err?.message,
                sessionId,
            });
            throw err;
        }
    }

    static async touchSession(sessionId) {
        try {
            return await SessionService.updateSessionData(sessionId, {
                lastActivity: new Date().toISOString(),
            });
        } catch (err) {
            dbLogger.error('Error touching session', {
                error: err?.message,
                sessionId,
            });
            throw err;
        }
    }

    static async cleanupExpiredSessions(maxInactivityTime = 30 * 60 * 1000) {
        try {
            const store = getSessionStore();
            return new Promise((resolve, reject) => {
                const now = Date.now();
                store.all((err, sessions) => {
                    if (err) return reject(err);

                    const promises = [];
                    for (const sid in sessions) {
                        const session = sessions[sid];
                        const lastActivity = session.lastActivity ? new Date(session.lastActivity).getTime() : 0;

                        if (now - lastActivity > maxInactivityTime) {
                            promises.push(
                                SessionService.invalidateSession(sid)
                                    .then(() => {
                                        dbLogger.info('Expired session removed', { sessionId: sid });
                                    })
                                    .catch(err => {
                                        dbLogger.error('Error removing expired session', {
                                            sessionId: sid,
                                            error: err?.message,
                                        });
                                    }),
                            );
                        }
                    }

                    Promise.all(promises).then(() => resolve(promises.length)).catch(reject);
                });
            });
        } catch (err) {
            dbLogger.error('Error cleaning up expired sessions', {
                error: err?.message,
            });
            throw err;
        }
    }
}