import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { serverLogger } from '../services/logger.service.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Reads the package version from package.json.
 */
function getPackageVersion() {
    let version = '1.0.0';
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));
        version = packageJson?.version ?? version;
    } catch (err) {
        serverLogger.error('Error reading package.json for Swagger version', { error: err?.message });
    }
    return version;
}

/**
 * Returns Swagger options for the API documentation.
 */
function getSwaggerOptions(version) {
    return {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Homeflix API',
                version,
                description: 'API for the Homeflix Media Server',
                license: { name: 'Private' },
                contact: { name: 'Homeflix Team' },
            },
            servers: [
                { url: '/', description: 'API v1' },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                    csrfToken: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'X-CSRF-Token',
                    },
                },
                schemas: {
                    Error: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: false },
                            error: {
                                type: 'object',
                                properties: {
                                    code: { type: 'string', example: 'ERROR_CODE' },
                                    message: { type: 'string', example: 'Human readable error message' },
                                    details: { type: 'object', example: {} },
                                },
                            },
                        },
                    },
                    Success: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            data: { type: 'object', example: {} },
                            meta: { type: 'object', example: {} },
                        },
                    },
                },
            },
        },
        apis: ['./src/routes/*.js', './src/controllers/*.js'],
    };
}

/**
 * Sets up Swagger UI for API documentation.
 */
export function setupSwagger(app) {
    try {
        const version = getPackageVersion();
        const swaggerOptions = getSwaggerOptions(version);
        const swaggerSpec = swaggerJsdoc(swaggerOptions);

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'Homeflix API Documentation',
        }));

        app.get('/api-docs.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });

        serverLogger.info('Swagger-UI available at /api-docs');
    } catch (error) {
        serverLogger.error('Error setting up Swagger-UI', { error: error?.message });
    }
}
