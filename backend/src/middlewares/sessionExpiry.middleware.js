import { dbLogger } from '../services/logger.service.js';
import { SessionService } from '../services/session.service.js';

export function sessionExpiryMiddleware(req, res, next) {
    if (req.session && req.isAuthenticated && req.isAuthenticated()) {
        const sessionId = req.sessionID;

        SessionService.getSessionData(sessionId)
            .then(session => {
                if (!session) {
                    return handleInvalidSession(req, res);
                }

                const lastActivity = session.lastActivity ? new Date(session.lastActivity).getTime() : Date.now();
                const maxInactivityTime = 30 * 60 * 1000; // 30 Minuten

                if (Date.now() - lastActivity > maxInactivityTime) {
                    return handleExpiredSession(req, res, sessionId);
                }

                SessionService.touchSession(sessionId)
                    .catch(err => {
                        dbLogger.error('Error touching session', {
                            error: err.message,
                            sessionId,
                        });
                    });

                next();
            })
            .catch(err => {
                dbLogger.error('Error checking session', {
                    error: err.message,
                    sessionId: req.sessionID,
                });
                next();
            });
    } else {
        next();
    }
}

function handleInvalidSession(req, res) {
    dbLogger.warn('Invalid session detected', { sessionId: req.sessionID });
    clearAuthCookies(res);
    return res.status(401).json({
        success: false,
        code: 'INVALID_SESSION',
        message: 'Invalid session. Please log in again.',
        details: {},
    });
}

function handleExpiredSession(req, res, sessionId) {
    dbLogger.info('Session expired due to inactivity', {
        userId: req.user?.id,
        sessionId,
    });

    SessionService.invalidateSession(sessionId)
        .catch(err => {
            dbLogger.error('Error invalidating expired session', {
                error: err.message,
                sessionId,
            });
        });

    clearAuthCookies(res);
    return res.status(401).json({
        success: false,
        code: 'SESSION_EXPIRED',
        message: 'The session has expired. Please log in again.',
        details: {},
    });
}

function clearAuthCookies(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('csrfToken');
}