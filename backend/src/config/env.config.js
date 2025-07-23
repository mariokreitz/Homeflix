import dotenv from 'dotenv';

dotenv.config();

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const isProduction = NODE_ENV === 'production';
export const isDevelopment = NODE_ENV === 'development';

// Server configuration
export const PORT = parseInt(process.env.PORT || '5500', 10);
export const HOST = process.env.HOST || 'localhost';
export const BASE_URL = process.env.BASE_URL || `http://${HOST}:${PORT}`;

// CORS settings
export const CORS_ORIGIN = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:4200'];

// Redis configuration
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Session & Token
export const SESSION_SECRET = process.env.SESSION_SECRET || '';
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || (isDevelopment ? 'access-token-secret' : '');
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || (isDevelopment ? 'refresh-token-secret' : '');
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
export const SESSION_PREFIX = process.env.SESSION_PREFIX || 'homeflix:session:';
export const TOKEN_PREFIX = process.env.TOKEN_PREFIX || 'homeflix:token:';

// Database
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/homeflix';

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
export const MORGAN_FORMAT = process.env.MORGAN_FORMAT || 'combined';
export const MORGAN_LOG_FILE = process.env.MORGAN_LOG_FILE || './logs/access.log';

// Optionale Log-Settings, falls in Zukunft benötigt
export const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './logs';
export const MAX_LOG_FILE_SIZE = process.env.MAX_LOG_FILE_SIZE || '10m';
export const MAX_LOG_FILES = parseInt(process.env.MAX_LOG_FILES || '5', 10);

// Seed / Demo User Configuration
export const SEED_DEMO_USER = process.env.SEED_DEMO_USER || 'user@example.com';
export const SEED_DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'password123';

// Validate critical environment variables in production mode
if (isProduction) {
    const requiredEnvVars = [
        'SESSION_SECRET',
        'DATABASE_URL',
        'REDIS_URL',
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Missing critical environment variables: ${missingEnvVars.join(', ')}`);
    }
}
