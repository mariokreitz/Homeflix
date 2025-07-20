import express from 'express';
import { devRequestLogger, requestLogger } from './middlewares/requestLogger.middleware.js';

const app = express();

app.use(requestLogger);
app.use(devRequestLogger);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: { message: 'API is up and running' },
        meta: { uptime: process.uptime() },
    });
});


export default app;