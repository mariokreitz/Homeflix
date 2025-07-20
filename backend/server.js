import { consoleLogger, serverLogger } from './src/services/logger.service.js';
import app from './src/app.js';
import { closeRedisClient } from './src/services/redis.service.js';
import { getPrisma } from './src/services/prisma.service.js';
import { PORT } from './src/config/env.config.js';

let server;

async function startServer() {
    server = app.listen(PORT, () => {
        consoleLogger.info(`Server running on port ${PORT}`);
        serverLogger.info(`Server running on port ${PORT}`);
    });
}

async function gracefulShutdown() {
    serverLogger.info('Graceful shutdown started...');
    consoleLogger.info('Graceful shutting down...');

    if (server) {
        server.close(() => {
            serverLogger.info('HTTP server stopped');
            consoleLogger.info('HTTP server stopped');
        });
    }

    try {
        await closeRedisClient();

        const prisma = getPrisma();
        await prisma.$disconnect();
        serverLogger.info('Database connection closed');
        consoleLogger.info('Database connection closed');
    } catch (error) {
        serverLogger.error('Error during shutdown', { error: error?.message });
        process.exit(1);
    }

    process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer().catch(error => {
    serverLogger.error('Error starting server', { error: error?.message });
    process.exit(1);
});