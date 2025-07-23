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
    verifySessionController,
} from '../controllers/auth.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *           description: Indicates successful operation
 *         data:
 *           type: object
 *           description: Contains the response data
 *         meta:
 *           type: object
 *           description: Contains metadata about the response
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *           description: Indicates failed operation
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: Error code for programmatic identification
 *             message:
 *               type: string
 *               description: Human readable error message
 *             details:
 *               type: object
 *               description: Additional error details if available
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token provided in the Authorization header or via cookies
 *     csrfToken:
 *       type: apiKey
 *       in: header
 *       name: X-CSRF-Token
 *       description: CSRF token required for state-changing operations
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *       description: Access token stored in HTTP-only cookie
 */

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
 *                 format: password
 *                 example: "password123"
 *                 description: Password for login
 *     responses:
 *       200:
 *         description: Successful login. Tokens are set as HTTP-only cookies.
 *         headers:
 *           Set-Cookie:
 *             description: Sets accessToken and refreshToken as HTTP-only cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 csrfToken: "uuid-csrf-token"
 *                 sessionId: "uuid-session-id"
 *                 user:
 *                   id: 1
 *                   email: "user@example.com"
 *                   role: "USER"
 *               meta: {}
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "INVALID_INPUT"
 *                 message: "Email and password are required"
 *                 details: {}
 *       401:
 *         description: Unauthorized (invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "INVALID_CREDENTIALS"
 *                 message: "Invalid email or password"
 *                 details: {}
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "RATE_LIMIT_EXCEEDED"
 *                 message: "Too many login attempts, please try again later"
 *                 details: { "retryAfter": 300 }
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
 *       - cookieAuth: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Successful logout. Tokens are cleared.
 *         headers:
 *           Set-Cookie:
 *             description: Clears accessToken and refreshToken cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 message: "Logout successful"
 *               meta: {}
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "UNAUTHORIZED"
 *                 message: "Authentication required"
 *                 details: {}
 *       403:
 *         description: CSRF token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "CSRF_REQUIRED"
 *                 message: "Invalid or missing CSRF token"
 *                 details: {}
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
 *                 example: "jwt-refresh-token"
 *                 description: Refresh token (optional if sent in cookie)
 *     responses:
 *       200:
 *         description: Successful token refresh
 *         headers:
 *           Set-Cookie:
 *             description: Sets new accessToken as HTTP-only cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 accessToken: "jwt-access-token"
 *                 csrfToken: "uuid-csrf-token"
 *                 sessionId: "uuid-session-id"
 *               meta: {}
 *       401:
 *         description: Unauthorized or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "NO_REFRESH_TOKEN"
 *                 message: "Refresh token is missing"
 *                 details: {}
 *       403:
 *         description: Token expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "INVALID_TOKEN"
 *                 message: "Refresh token is invalid or expired"
 *                 details: {}
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
 *                 example: "jwt-refresh-token"
 *                 description: Refresh token to rotate (optional if sent in cookie)
 *     responses:
 *       200:
 *         description: Successful token rotation
 *         headers:
 *           Set-Cookie:
 *             description: Sets new accessToken and refreshToken as HTTP-only cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 accessToken: "jwt-access-token"
 *                 refreshToken: "jwt-refresh-token"
 *                 csrfToken: "uuid-csrf-token"
 *                 sessionId: "uuid-session-id"
 *               meta: {}
 *       401:
 *         description: Unauthorized or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "NO_REFRESH_TOKEN"
 *                 message: "Refresh token is missing"
 *                 details: {}
 *       403:
 *         description: Token expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "INVALID_TOKEN"
 *                 message: "Refresh token is invalid or expired"
 *                 details: {}
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
 *                 example: "uuid-session-id"
 *                 description: Session ID to revoke (optional, defaults to current)
 *     responses:
 *       200:
 *         description: Successful session revoke
 *         headers:
 *           Set-Cookie:
 *             description: Clears accessToken and refreshToken cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 message: "Session revoked successfully"
 *               meta: {}
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "UNAUTHORIZED"
 *                 message: "Authentication required"
 *                 details: {}
 *       403:
 *         description: CSRF token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "CSRF_REQUIRED"
 *                 message: "Invalid or missing CSRF token"
 *                 details: {}
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
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: CSRF token returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 csrfToken: "uuid-csrf-token"
 *               meta:
 *                 sessionId: "uuid-session-id"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "SESSION_ID_MISSING"
 *                 message: "Session ID is missing"
 *                 details: {}
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
 *                 format: password
 *                 minLength: 8
 *                 example: "password123"
 *                 description: Desired password
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: 2
 *                   email: "newuser@example.com"
 *                   role: "USER"
 *                   isActive: true
 *                   createdAt: "2025-07-20T06:00:00.000Z"
 *                   updatedAt: "2025-07-20T06:00:00.000Z"
 *                   lastLoginAt: null
 *                   failedLoginAttempts: 0
 *                   refreshTokenVersion: 0
 *               meta: {}
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "INVALID_INPUT"
 *                 message: "Email and password are required"
 *                 details: {}
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "EMAIL_EXISTS"
 *                 message: "Email already exists"
 *                 details: {}
 */
router.post('/register', registerController);

/**
 * @openapi
 * /api/v1/auth/verify-session:
 *   get:
 *     summary: Verify current session
 *     description: |
 *       Verifies if the user's session is valid and active.
 *       Returns the user's information and session details if authenticated.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 sessionId: "uuid-session-id"
 *                 user:
 *                   id: 1
 *               meta: {}
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "UNAUTHORIZED"
 *                 message: "User not authenticated"
 *                 details: {}
 */
router.get('/verify-session', authenticate, verifySessionController);

export default router;