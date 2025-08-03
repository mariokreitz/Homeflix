import { PrismaClient } from '@prisma/client';
import { consoleLogger, dbLogger } from './logger.service.js';

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
        errorFormat: 'pretty',
        log: ['info'],
    });
}

export const prisma = globalForPrisma.prisma;

prisma.$on('warn', (e) => {
    dbLogger.warn('Prisma warning', { warning: e.message });
});
prisma.$on('info', (e) => {
    dbLogger.info('Prisma info', { info: e.message });
});

export async function connectPrisma() {
    try {
        await prisma.$connect();
        dbLogger.info('Prisma DB connection established');
        consoleLogger.info('Prisma DB client connected');
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