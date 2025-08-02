import { dbLogger } from '../services/logger.service.js';

/**
 * Checks and updates the session expiry time
 */
export function sessionExpiryMiddleware(req, res, next) {
    if (req.session && req.isAuthenticated && req.isAuthenticated()) {
        req.session.lastActivity = Date.now();

        const maxInactivityTime = 30 * 60 * 1000; // 30 minutes
        const lastActivity = req.session.lastActivity || Date.now();

        if (Date.now() - lastActivity > maxInactivityTime) {
            dbLogger.info('Session closed due to inactivity', {
                userId: req.user?.id,
                sessionId: req.sessionID,
            });

            req.session.destroy((err) => {
                if (err) {
                    dbLogger.error('Error destroying session', {
                        error: err.message,
                        sessionId: req.sessionID,
                    });
                }

                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
                res.clearCookie('csrfToken');
                return res.status(401).json({
                    success: false,
                    code: 'SESSION_EXPIRED',
                    message: 'The session has expired. Please log in again.',
                    details: {},
                });
            });
            return;
        }
    }

    next();
}