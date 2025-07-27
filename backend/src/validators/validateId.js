import Joi from 'joi';
import { dbLogger } from '../services/logger.service.js';

/**
 * Validiert eine Medien-ID mit Joi Schema.
 *
 * @param {string} id - Die zu validierende ID
 * @returns {boolean} True wenn die ID gültig ist, sonst false
 */
export function validateId(id) {
    try {
        const schema = Joi.string().uuid().required();

        const { error } = schema.validate(id);

        if (error) {
            dbLogger.debug('Ungültige ID-Format', { id, error: error.message });
            return false;
        }

        return true;
    } catch (error) {
        dbLogger.error('Fehler bei ID-Validierung', { id, error });
        return false;
    }
}