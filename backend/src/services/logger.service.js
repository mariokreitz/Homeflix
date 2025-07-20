import winston from 'winston';
import path from 'path';
import { LOG_LEVEL } from '../config/env.config.js';

const logsDir = path.resolve(process.cwd(), 'logs');

const createFileLogger = (serviceName) => {
    if (typeof serviceName !== 'string' || !serviceName) {
        throw new TypeError('serviceName muss ein nicht-leerer String sein');
    }
    return winston.createLogger({
        level: LOG_LEVEL,
        format: winston.format.json(),
        transports: [
            new winston.transports.File({ filename: path.join(logsDir, `${serviceName}-error.log`), level: 'error' }),
            new winston.transports.File({ filename: path.join(logsDir, `${serviceName}-combined.log`) }),
        ],
    });
};

const createConsoleLogger = (serviceName) => {
    if (typeof serviceName !== 'string' || !serviceName) {
        throw new TypeError('serviceName muss ein nicht-leerer String sein');
    }
    return winston.createLogger({
        level: LOG_LEVEL,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
        ),
        transports: [
            new winston.transports.Console(),
        ],
    });
};

export const serverLogger = createFileLogger('server');
export const httpLogger = createFileLogger('http');
export const authLogger = createFileLogger('auth');
export const dbLogger = createFileLogger('db');

export const consoleLogger = createConsoleLogger('console');