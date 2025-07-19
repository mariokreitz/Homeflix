import app from './src/app.js';
import { PORT } from './src/config/config.js';

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});