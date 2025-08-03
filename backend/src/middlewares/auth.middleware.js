import { TokenService } from '../services/token.service.js';
import { createHttpError } from './errorHandler.middleware.js';
import { SessionService } from '../services/session.service.js';

export async function authenticate(req, res, next) {
    const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
    const sessionId = req.sessionID;

    if (!token && !sessionId) {
        return next(createHttpError('NO_AUTH', 'Authentication required', 401));
    }

    try {
        if (token) {
            const payload = await TokenService.validateAccessToken(token);

            const tokenSession = await TokenService.getTokenSession(payload.sessionId);
            if (!tokenSession) {
                return next(createHttpError('INVALID_TOKEN_SESSION', 'Token session invalid', 401));
            }

            req.user = {
                id: payload.userId,
                sessionId: payload.sessionId,
                authMethod: 'token',
            };
        } else if (sessionId) {
            const sessionData = await SessionService.getSessionData(sessionId);

            if (!sessionData || !sessionData.passport?.user) {
                return next(createHttpError('INVALID_SESSION', 'Invalid session', 401));
            }

            if (!sessionId) {
                return next(createHttpError('INVALID_SESSION', 'Token session not linked', 401));
            }

            try {
                await TokenService.getTokenSession(sessionId);
            } catch (err) {
                return next(createHttpError('EXPIRED_SESSION', 'Session expired', 401));
            }

            req.user = {
                id: sessionData.passport.user,
                sessionId,
                authMethod: 'session',
            };
        }

        await SessionService.touchSession(req.user.sessionId);
        next();
    } catch (err) {
        next(err);
    }
}

export async function requireCsrf(req, res, next) {
    const sessionId = req.user?.sessionId || req.sessionID;
    const csrfToken = req.cookies?.csrfToken || req.headers['x-csrf-token'];

    if (!sessionId || !csrfToken) {
        return next(createHttpError('CSRF_MISSING', 'CSRF token is missing', 403));
    }

    try {
        await TokenService.validateCsrfToken(sessionId, csrfToken);
        next();
    } catch (err) {
        next(err);
    }
}