import express from 'express';
import { getMediaById, listMedia } from '../controllers/media.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateMediaId } from '../middlewares/validation.middleware.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Genre:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Action"
 *     Person:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174001"
 *         name: "John Doe"
 *     Media:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         releaseYear:
 *           type: integer
 *           nullable: true
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *           nullable: true
 *         posterPath:
 *           type: string
 *           nullable: true
 *         filePath:
 *           type: string
 *         mediaType:
 *           type: string
 *           enum: [MOVIE, SERIES]
 *         genres:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Genre'
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174002"
 *         title: "Example Movie"
 *         description: "A great movie"
 *         releaseYear: 2023
 *         duration: 120
 *         posterPath: "/path/to/poster.jpg"
 *         filePath: "/movies/example-movie.mp4"
 *         mediaType: "MOVIE"
 *         genres: [{ id: "123e4567-e89b-12d3-a456-426614174000", name: "Action" }]
 *     MediaDetailed:
 *       allOf:
 *         - $ref: '#/components/schemas/Media'
 *         - type: object
 *           properties:
 *             actors:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Person'
 *             directors:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Person'
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174002"
 *         title: "Example Movie"
 *         description: "A great movie"
 *         releaseYear: 2023
 *         duration: 120
 *         posterPath: "/path/to/poster.jpg"
 *         filePath: "/movies/example-movie.mp4"
 *         mediaType: "MOVIE"
 *         genres: [{ id: "123e4567-e89b-12d3-a456-426614174000", name: "Action" }]
 *         actors: [{ id: "123e4567-e89b-12d3-a456-426614174001", name: "John Doe" }]
 *         directors: [{ id: "123e4567-e89b-12d3-a456-426614174003", name: "Jane Smith" }]
 */

/**
 * @openapi
 * tags:
 *   - name: Media
 *     description: Endpoints for managing media (movies, series)
 */

/**
 * @openapi
 * /api/v1/media:
 *   get:
 *     summary: Get all media
 *     description: Retrieves a list of all available media with basic information
 *     tags: [Media]
 *     security:
 *       - cookieAuth: []
 *       - csrfAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved media list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Media'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: Number of media items returned
 *                       example: 2
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "UNAUTHORIZED"
 *                 message: "Not authenticated"
 *                 details: {}
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "MEDIA_LIST_ERROR"
 *                 message: "Error retrieving media"
 *                 details: {}
 */
router.get('/', authenticate, listMedia);

/**
 * @openapi
 * /api/v1/media/{id}:
 *   get:
 *     summary: Get media by ID
 *     description: Retrieves detailed information about a media item by its ID
 *     tags: [Media]
 *     security:
 *       - cookieAuth: []
 *       - csrfAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the media item
 *     responses:
 *       200:
 *         description: Media successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MediaDetailed'
 *                 meta:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid media ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "INVALID_MEDIA_ID"
 *                 message: "Invalid media ID"
 *                 details: { "id": "invalid-id" }
 *       404:
 *         description: Media not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "MEDIA_NOT_FOUND"
 *                 message: "Media not found"
 *                 details: { "id": "123e4567-e89b-12d3-a456-426614174099" }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "UNAUTHORIZED"
 *                 message: "Not authenticated"
 *                 details: {}
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "MEDIA_FETCH_ERROR"
 *                 message: "Error retrieving media"
 *                 details: {}
 */
router.get('/:id', authenticate, validateMediaId, getMediaById);

export default router;
