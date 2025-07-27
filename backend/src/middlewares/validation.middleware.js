import { validateId } from '../validators/validateId.js';
import { httpLogger } from '../services/logger.service.js';

export const validateMediaId = (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        httpLogger.warn('Missing media id in request', { path: req.path });
        return res.status(400).json({
            success: false,
            error: {
                code: 'MISSING_MEDIA_ID',
                message: 'No media ID provided',
                details: { path: req.path },
            },
        });
    }

    if (!validateId(id)) {
        httpLogger.warn('Invalid ID in request', { id, path: req.path });
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_MEDIA_ID',
                message: 'Invalid media ID format',
                details: { id },
            },
        });
    }

    next();
};