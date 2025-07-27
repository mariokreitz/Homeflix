import { httpLogger } from '../services/logger.service.js';
import mediaService from '../services/media.service.js';

export const listMedia = async (req, res, next) => {
    try {
        const media = await mediaService.getAllMedia();
        if (!Array.isArray(media)) {
            httpLogger.error('mediaService.getAllMedia() returned non-array', { media });
            return next({
                status: 500,
                code: 'MEDIA_LIST_INVALID',
                message: 'Internal error while listing media',
                details: {},
            });
        }
        res.status(200).json({
            success: true,
            data: media,
            meta: { count: media.length },
        });
    } catch (error) {
        httpLogger.error('Error while listing media ', { error });
        next({
            status: 500,
            code: 'MEDIA_LIST_ERROR',
            message: 'Error retrieving media',
            details: {},
        });
    }
};

export const getMediaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string' || id.trim() === '') {
            httpLogger.warn('Invalid media ID', { id });
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_MEDIA_ID',
                    message: 'Invalid media ID',
                    details: { id },
                },
            });
        }
        const media = await mediaService.getMediaById(id);
        if (!media) {
            httpLogger.info('Media not found', { id });
            return res.status(404).json({
                success: false,
                error: {
                    code: 'MEDIA_NOT_FOUND',
                    message: 'Media not found',
                    details: { id },
                },
            });
        }
        res.status(200).json({
            success: true,
            data: media,
            meta: {},
        });
    } catch (error) {
        httpLogger.error('Error retrieving media item', { error });
        next({
            status: 500,
            code: 'MEDIA_FETCH_ERROR',
            message: 'Error retrieving media',
            details: {},
        });
    }
};