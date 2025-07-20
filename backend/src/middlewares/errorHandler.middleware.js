import { isProduction } from '../config/env.config.js';
import { serverLogger } from '../services/logger.service.js';

/**
 * Returns error details for non-production environments.
 * @param {Error} err
 * @param {import('express').Request} req
 * @returns {object}
 */
function getErrorDetails(err, req) {
    if (isProduction) return {};
    return {
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Logs error based on severity.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {number} statusCode
 * @param {string} errorCode
 * @param {string} message
 */
function logError(err, req, statusCode, errorCode, message) {
    const logData = {
        error: errorCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    };
    if (statusCode >= 500) {
        serverLogger.error(`${statusCode} Error: ${message}`, logData);
    } else {
        serverLogger.warn(`${statusCode} Error: ${message}`, logData);
    }
}

/**
 * Central error handling middleware.
 */
export function errorHandlerMiddleware(err, req, res, next) {
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
    const errorCode = typeof err.code === 'string' ? err.code : 'INTERNAL_SERVER_ERROR';
    const message = typeof err.message === 'string' ? err.message : 'An unexpected error occurred';

    logError(err, req, statusCode, errorCode, message);

    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message,
            details: getErrorDetails(err, req),
        },
    });
}

/**
 * Factory for standardized HTTP error objects.
 */
export function createHttpError(code, message, statusCode = 400, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = statusCode;
    error.details = details;
    return error;
}
