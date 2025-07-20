import { Router } from 'express';
import { authenticate, requireCsrf } from '../middlewares/auth.middleware.js';
import {
    csrfController,
    loginController,
    logoutController,
    refreshTokenController,
    registerController,
    revokeSessionController,
    rotateTokenController,
} from '../controllers/auth.controller.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication and session management endpoints for Homeflix API.
 */

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and create a new session
 *     description: |
 *       Authenticates a user using email and password.
 *       Returns access, refresh, and CSRF tokens in secure cookies.
 *       Use these tokens for subsequent authenticated requests.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email for login
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: Password for login
 *     responses:
 *       200:
 *         description: Successful login. Tokens are set as HTTP-only cookies.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     csrfToken: "uuid-csrf-token"
 *                     sessionId: "uuid-session-id"
 *                     user:
 *                       id: 1
 *                       email: "user@example.com"
 *                       role: "USER"
 *                   meta: {}
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', loginController);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and invalidate the session
 *     description: |
 *       Invalidates the current session and all related tokens.
 *       Requires authentication and a valid CSRF token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Successful logout. Tokens are cleared.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     message: "Logout successful"
 *                   meta: {}
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: CSRF token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticate, requireCsrf, logoutController);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using a refresh token
 *     description: |
 *       Rotates the access token using a valid refresh token.
 *       Returns a new access token and CSRF token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "jwt-refresh-token"
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Successful token refresh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     accessToken: "jwt-access-token"
 *                     csrfToken: "uuid-csrf-token"
 *                     sessionId: "uuid-session-id"
 *                   meta: {}
 *       401:
 *         description: Unauthorized or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', refreshTokenController);

/**
 * @openapi
 * /api/v1/auth/rotate:
 *   post:
 *     summary: Rotate the refresh token and get new tokens
 *     description: |
 *       Rotates the refresh token and returns new access, refresh, and CSRF tokens.
 *       Use this endpoint to proactively rotate tokens for enhanced security.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "jwt-refresh-token"
 *                 description: Refresh token to rotate
 *     responses:
 *       200:
 *         description: Successful token rotation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     accessToken: "jwt-access-token"
 *                     refreshToken: "jwt-refresh-token"
 *                     csrfToken: "uuid-csrf-token"
 *                     sessionId: "uuid-session-id"
 *                   meta: {}
 *       401:
 *         description: Unauthorized or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/rotate', rotateTokenController);

/**
 * @openapi
 * /api/v1/auth/revoke:
 *   post:
 *     summary: Revoke the session and all tokens
 *     description: |
 *       Revokes the current session and all associated tokens.
 *       Requires authentication and a valid CSRF token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "uuid-session-id"
 *                 description: Session ID to revoke (optional, defaults to current)
 *     responses:
 *       200:
 *         description: Successful session revoke
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     message: "Session revoked successfully"
 *                   meta: {}
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: CSRF token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/revoke', authenticate, requireCsrf, revokeSessionController);

/**
 * @openapi
 * /api/v1/auth/csrf:
 *   get:
 *     summary: Get CSRF token for the current session
 *     description: |
 *       Returns the CSRF token for the current authenticated session.
 *       Use this token in the `X-CSRF-Token` header for state-changing requests.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSRF token returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     csrfToken: "uuid-csrf-token"
 *                   meta:
 *                     sessionId: "uuid-session-id"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/csrf', authenticate, csrfController);

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Registers a new user account.
 *       Requires a unique email and a password.
 *       Does not log in the user automatically.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@example.com"
 *                 description: Desired email address
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: Desired password
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     user:
 *                       id: 2
 *                       email: "newuser@example.com"
 *                       role: "USER"
 *                       isActive: true
 *                       createdAt: "2025-07-20T06:00:00.000Z"
 *                       updatedAt: "2025-07-20T06:00:00.000Z"
 *                       lastLoginAt: null
 *                       failedLoginAttempts: 0
 *                       refreshTokenVersion: 0
 *                   meta: {}
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', registerController);

export default router;