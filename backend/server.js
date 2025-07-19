import app from './src/app.js';
import { PORT } from './src/config/config.js';
import { serverLogger } from './src/services/logger.js';

app.listen(PORT, () => {
    serverLogger.info(`Server started on port ${PORT}`);
    console.log(`Server is running on port ${PORT}`);
});