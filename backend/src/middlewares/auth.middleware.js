import { TokenService } from '../services/token.service.js';
import { createHttpError } from './errorHandler.middleware.js';

export async function authenticate(req, res, next) {
    const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return next(createHttpError('NO_TOKEN', 'Token is missing', 401));
    }
    try {
        const payload = await TokenService.validateAccessToken(token);
        req.user = { id: payload.userId, sessionId: payload.sessionId };
        next();
    } catch (err) {
        next(err);
    }
}

export async function requireCsrf(req, res, next) {
    const sessionId = req.user?.sessionId;
    const csrfToken = req.headers['x-csrf-token'];
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