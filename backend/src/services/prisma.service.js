import { PrismaClient } from '@prisma/client';
import { dbLogger } from './logger.service.js';

const prisma = new PrismaClient();

prisma.$on('error', (e) => {
    dbLogger.error('Prisma error', { error: e.message });
});

export async function connectPrisma() {
    try {
        await prisma.$connect();
        dbLogger.info('Prisma DB connection established');
    } catch (err) {
        dbLogger.error('Prisma DB connection error', { error: err?.message ?? err });
        throw new Error('DB connection failed');
    }
}

export function getPrisma() {
    if (!prisma) {
        dbLogger.error('Prisma client not initialized');
        throw new Error('Prisma client not initialized');
    }
    return prisma;
}