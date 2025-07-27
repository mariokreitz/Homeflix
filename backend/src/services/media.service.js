import { consoleLogger, dbLogger } from './logger.service.js';
import { validateId } from '../validators/validateId.js';

export async function getAllMedia() {
    try {
        consoleLogger.debug('Retrieving all media');

        const mediaItems = await prisma.media.findMany({
            orderBy: { title: 'asc' },
            include: {
                genres: true,
            },
        });

        return mediaItems;
    } catch (error) {
        dbLogger.error('Database error while retrieving all media', { error });
        throw new Error('Database error while retrieving media');
    }
}

export async function getMediaById(id) {
    try {
        if (!validateId(id)) {
            consoleLogger.warn('Invalid media ID in getMediaById', { id });
            return null;
        }

        consoleLogger.debug('Retrieving media by ID', { id });

        const media = await prisma.media.findUnique({
            where: { id },
            include: {
                genres: true,
                actors: true,
                directors: true,
            },
        });

        return media;
    } catch (error) {
        dbLogger.error('Database error while retrieving a media item', { id, error });
        throw new Error(`Error retrieving media with ID ${id}`);
    }
}

export default {
    getAllMedia,
    getMediaById,
};