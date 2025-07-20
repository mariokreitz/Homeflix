import dotenv from 'dotenv';

dotenv.config();

// Umgebung
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const isProduction = NODE_ENV === 'production';
export const isDevelopment = NODE_ENV === 'development';

// Server-Konfiguration
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const HOST = process.env.HOST || 'localhost';
export const BASE_URL = process.env.BASE_URL || `https://${HOST}:${PORT}`;

// CORS-Einstellungen
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200,http://localhost:3000';

// Redis-Konfiguration
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const SESSION_PREFIX = process.env.SESSION_PREFIX || 'homeflix:session:';
export const TOKEN_PREFIX = process.env.TOKEN_PREFIX || 'homeflix:token:';

// Session & Token
export const SESSION_SECRET = process.env.SESSION_SECRET || (isDevelopment ? 'dev-secret' : '');
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || (isDevelopment ? 'access-token-secret' : '');
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || (isDevelopment ? 'refresh-token-secret' : '');
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

// Datenbank
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/homeflix';

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');
export const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './logs';
export const MAX_LOG_FILE_SIZE = process.env.MAX_LOG_FILE_SIZE || '10m';
export const MAX_LOG_FILES = parseInt(process.env.MAX_LOG_FILES || '5', 10);

// Morgan HTTP-Logging
export const MORGAN_FORMAT = process.env.MORGAN_FORMAT || 'combined';
export const MORGAN_LOG_FILE = process.env.MORGAN_LOG_FILE || './logs/access.log';

// Validierung der kritischen Umgebungsvariablen im Produktionsmodus
if (isProduction) {
    const requiredEnvVars = [
        'SESSION_SECRET',
        'ACCESS_TOKEN_SECRET',
        'REFRESH_TOKEN_SECRET',
        'DATABASE_URL',
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Fehlende kritische Umgebungsvariablen: ${missingEnvVars.join(', ')}`);
    }
}
