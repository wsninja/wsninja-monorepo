import { existsDb, initDb as db_initDb } from 'db/db';
import { logError, logMessage } from 'utils/base';

const initDb = async () => {
	try {
		if (existsDb()) {
			logMessage('Database does already exist.');
		} else {
			await db_initDb();
			logMessage('Database created-');
		}
	} catch (e) {
		logError(e);
		process.exit(1);
	}
};

initDb();
