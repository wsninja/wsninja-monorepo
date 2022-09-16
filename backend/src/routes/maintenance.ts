import { getDatabase, health, setDatabase } from 'controllers/maintenance';
import { AsyncRouter } from 'express-async-router';

export const maintenanceRouter = AsyncRouter();

maintenanceRouter.get('/health', health);
maintenanceRouter.post('/getDatabase', getDatabase);
maintenanceRouter.post('/setDatabase', setDatabase);
