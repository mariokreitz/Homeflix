import app from './src/app.js';
import { PORT } from './src/config/env.config.js';
import { consoleLogger, serverLogger } from './src/services/logger.service.js';

app.listen(PORT, () => {
    serverLogger.info(`Server started on port ${PORT}`);
    consoleLogger.info(`Server started on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
    serverLogger.error('Uncaught Exception', { error: err });
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    serverLogger.error('Unhandled Rejection', { reason });
    process.exit(1);
});