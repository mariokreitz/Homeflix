import { createHttpError } from '../middlewares/errorHandler.middleware.js';
import { TokenService } from '../services/token.service.js';
import bcrypt from 'bcrypt';
import { prisma } from '../services/prisma.service.js';
import passport from '../services/passport.service.js';

function setAuthCookies(res, tokens) {
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 15,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
}

export function loginController(req, res, next) {
    passport.authenticate('local', { session: true }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return next(createHttpError('INVALID_CREDENTIALS', info?.message || 'Invalid credentials', 401));
        req.login(user, { session: true }, async loginErr => {
            if (loginErr) return next(loginErr);
            try {
                const tokens = await TokenService.generateTokens(user.id);
                setAuthCookies(res, tokens);
                res.status(200).json({
                    success: true,
                    data: {
                        csrfToken: tokens.csrfToken,
                        sessionId: tokens.sessionId,
                        user: {
                            id: user.id,
                            email: user.email,
                            role: user.role,
                        },
                    },
                    meta: {},
                });
            } catch (tokenErr) {
                next(tokenErr);
            }
        });
    })(req, res, next);
}

export async function logoutController(req, res, next) {
    const sessionId = req.user?.sessionId;
    if (!sessionId) return next(createHttpError('SESSION_ID_MISSING', 'Session ID is missing', 401));
    try {
        await TokenService.invalidateSession(sessionId);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({
            success: true,
            data: { message: 'Logout successful' },
            meta: {},
        });
    } catch (err) {
        next(err);
    }
}

export async function refreshTokenController(req, res, next) {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) return next(createHttpError('NO_REFRESH_TOKEN', 'Refresh token is missing', 401));
    try {
        const result = await TokenService.refreshAccessToken(refreshToken);
        setAuthCookies(res, {
            accessToken: result.accessToken,
            refreshToken: req.cookies?.refreshToken ?? result.refreshToken,
        });
        res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
                csrfToken: result.csrfToken,
                sessionId: result.sessionId,
            },
            meta: {},
        });
    } catch (err) {
        next(err);
    }
}

export async function rotateTokenController(req, res, next) {
    const oldRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!oldRefreshToken) return next(createHttpError('NO_REFRESH_TOKEN', 'Refresh token is missing', 401));
    try {
        const result = await TokenService.rotateRefreshToken(oldRefreshToken);
        setAuthCookies(res, result);
        res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                csrfToken: result.csrfToken,
                sessionId: result.sessionId,
            },
            meta: {},
        });
    } catch (err) {
        next(err);
    }
}

export async function revokeSessionController(req, res, next) {
    const sessionId = req.user?.sessionId || req.body?.sessionId;
    if (!sessionId) return next(createHttpError('SESSION_ID_MISSING', 'Session ID is missing', 400));
    try {
        await TokenService.revokeSession(sessionId);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({
            success: true,
            data: { message: 'Session revoked successfully' },
            meta: {},
        });
    } catch (err) {
        next(err);
    }
}

export async function csrfController(req, res, next) {
    const sessionId = req.user?.sessionId;
    if (!sessionId) return next(createHttpError('SESSION_ID_MISSING', 'Session ID is missing', 401));
    try {
        const { csrfToken } = await TokenService.getCsrfToken(sessionId);
        res.status(200).json({
            success: true,
            data: { csrfToken },
            meta: { sessionId },
        });
    } catch (err) {
        next(err);
    }
}

export async function registerController(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) return next(createHttpError('INVALID_INPUT', 'Email and password are required', 400));
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return next(createHttpError('EMAIL_EXISTS', 'Email already exists', 409));
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'USER',
                isActive: true,
                failedLoginAttempts: 0,
                refreshTokenVersion: 0,
            },
        });
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    lastLoginAt: user.lastLoginAt,
                    failedLoginAttempts: user.failedLoginAttempts,
                    refreshTokenVersion: user.refreshTokenVersion,
                },
            },
            meta: {},
        });
    } catch (err) {
        next(err);
    }
}
