import winston from 'winston';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'logs');

const createLogger = (serviceName, level = 'info') => {
    return winston.createLogger({
        level,
        format: winston.format.json(),
        defaultMeta: { service: serviceName },
        transports: [
            new winston.transports.File({ filename: path.join(logsDir, `${serviceName}-error.log`), level: 'error' }),
            new winston.transports.File({ filename: path.join(logsDir, `${serviceName}-combined.log`) }),
        ],
    });
};

if (process.env.NODE_ENV !== 'production') {
    const consoleTransport = new winston.transports.Console({
        format: winston.format.simple(),
    });
    ['http', 'auth', 'db', 'server'].forEach(service =>
        createLogger(service).add(consoleTransport),
    );
}

export const serverLogger = createLogger('server');
export const httpLogger = createLogger('http');
export const authLogger = createLogger('auth');
export const dbLogger = createLogger('db');