import morgan from 'morgan';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { MORGAN_FORMAT, MORGAN_LOG_FILE } from '../config/env.config.js';
import path from 'path';
import { serverLogger } from '../services/logger.service.js';

const logDir = path.dirname(MORGAN_LOG_FILE);
if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
}

let stream;
try {
    stream = createWriteStream(MORGAN_LOG_FILE, { flags: 'a' });
} catch (err) {
    stream = process.stdout;
    serverLogger.error('Fehler beim Erstellen des Log-Streams', { error: err.message });
}

const logFormat = MORGAN_FORMAT;

export const requestLogger = morgan(logFormat, {
    stream,
    skip: (req, res) => process.env.NODE_ENV === 'test',
});

export const devRequestLogger = process.env.NODE_ENV === 'development'
    ? morgan(logFormat)
    : (req, res, next) => next();
