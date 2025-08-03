import { TokenService } from '../services/token.service.js';
import { SessionService } from '../services/session.service.js';
import { createHttpError } from './errorHandler.middleware.js';

export async function validateSessionStrict(req, res, next) {
    if (!req.user?.sessionId) {
        return next(createHttpError('SESSION_MISSING', 'Session required', 401));
    }

    try {
        const sessionId = req.user.sessionId;
        const tokenSession = await TokenService.getTokenSession(sessionId);
        const expressSession = await SessionService.getSessionData(sessionId);

        const tokenUserId = tokenSession.userId ?? tokenSession.passport?.user;
        const expressUserId = expressSession.userId ?? expressSession.passport?.user;

        if (tokenUserId !== req.user.id || expressUserId !== req.user.id) {
            return next(createHttpError('SESSION_MISMATCH', 'Session integrity violation', 401));
        }

        const lastActivity = tokenSession.lastActivity || expressSession?.lastActivity;
        if (lastActivity) {
            const maxInactivity = 30 * 60 * 1000; // 30 Minuten
            if (Date.now() - new Date(lastActivity).getTime() > maxInactivity) {
                await SessionService.invalidateSession(sessionId);
                return next(createHttpError('SESSION_EXPIRED', 'Session expired due to inactivity', 401));
            }
        }

        next();
    } catch (err) {
        next(err);
    }
}