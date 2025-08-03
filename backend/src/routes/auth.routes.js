import { Router } from 'express';
import { authenticate, requireCsrf } from '../middlewares/auth.middleware.js';
import {
    csrfController,
    loginController,
    logoutController,
    refreshTokenController,
    registerController,
    revokeSessionController,
    verifySessionController,
} from '../controllers/auth.controller.js';
import { validateSessionStrict } from '../middlewares/sessionValidation.middleware.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         failedLoginAttempts:
 *           type: integer
 *           example: 0
 *
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: password123
 *         rememberMe:
 *           type: boolean
 *           default: false
 *
 *     RegisterRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: newuser@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: password123
 *
 *     AuthResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Success'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   format: uuid
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *
 *     TokenResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Success'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   format: uuid
 *
 *     CsrfResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Success'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   format: uuid
 *
 *     MessageResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Success'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *         meta:
 *           type: object
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             message:
 *               type: string
 *             details:
 *               type: object
 *
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           examples:
 *             invalidCredentials:
 *               summary: Invalid credentials
 *               value:
 *                 success: false
 *                 error:
 *                   code: INVALID_CREDENTIALS
 *                   message: Invalid email or password
 *                   details: {}
 *             sessionMissing:
 *               summary: Session missing
 *               value:
 *                 success: false
 *                 error:
 *                   code: SESSION_ID_MISSING
 *                   message: Session ID is missing
 *                   details: {}
 *
 *     Forbidden:
 *       description: Forbidden - CSRF token required
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: CSRF_REQUIRED
 *               message: Invalid or missing CSRF token
 *               details: {}
 *
 *     BadRequest:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: INVALID_INPUT
 *               message: Email and password are required
 *               details: {}
 *
 *     Conflict:
 *       description: Conflict
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: EMAIL_EXISTS
 *               message: Email already exists
 *               details: {}
 *
 *     RateLimit:
 *       description: Rate limit exceeded
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: RATE_LIMIT_EXCEEDED
 *               message: Too many login attempts, please try again later
 *               details:
 *                 retryAfter: 300
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     csrfToken:
 *       type: apiKey
 *       in: header
 *       name: X-CSRF-Token
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *
 * tags:
 *   - name: Auth
 *     description: Authentication and session management
 */

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and create session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '429':
 *         $ref: '#/components/responses/RateLimit'
 */
router.post('/login', loginController);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and invalidate session
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *       - csrfToken: []
 *     responses:
 *       '200':
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/logout', authenticate, requireCsrf, logoutController);

/**
 * @openapi
 * /api/v1/auth/token/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/token/refresh', requireCsrf, refreshTokenController);

/**
 * @openapi
 * /api/v1/auth/token/revoke:
 *   post:
 *     summary: Revoke session and tokens
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
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
 *                 format: uuid
 *     responses:
 *       '200':
 *         description: Session revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/token/revoke', authenticate, requireCsrf, revokeSessionController);

/**
 * @openapi
 * /api/v1/auth/token/csrf:
 *   get:
 *     summary: Get CSRF token
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: CSRF token returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CsrfResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/token/csrf', authenticate, csrfController);

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/register', registerController);

/**
 * @openapi
 * /api/v1/auth/verify-session:
 *   get:
 *     summary: Verify current session
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Session verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         sessionId:
 *                           type: string
 *                           format: uuid
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/verify-session', authenticate, validateSessionStrict, verifySessionController);

export default router;
