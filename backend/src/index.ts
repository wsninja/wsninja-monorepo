import bodyParser from 'body-parser';
import { initSwapTokenCache } from 'cache/swap';
import { initTokenCache } from 'cache/tokens';
import { HOST, PORT } from 'constants/env';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { bitcoinRouter } from 'routes/bitcoin';
import { maintenanceRouter } from 'routes/maintenance';
import { notificationRouter } from 'routes/notification';
import { swapRouter } from 'routes/swap';
import { tokenRouter } from 'routes/token';
import { userRouter } from 'routes/user';
import { walletRouter } from 'routes/wallet';
import { errorToString, logError, logMessage } from 'utils/base';
import { HttpError } from 'utils/httpError';

const main = async () => {
	try {
		initTokenCache();
		initSwapTokenCache();

		const app = express(); // Setup app

		app.use(helmet());
		app.use(morgan(':date[iso] :method :url :status :response-time ms - :res[content-length] - :remote-addr')); // For logs
		app.use(cors());

		app.use(bodyParser.urlencoded({ extended: false })); // Body Parser
		app.use(bodyParser.json());

		//Initialize routes
		app.use('/api/swap', swapRouter);
		app.use('/api/token', tokenRouter);
		app.use('/api/wallet', walletRouter);
		app.use('/api/user', userRouter);
		app.use('/api/notification', notificationRouter);
		app.use('/api/bitcoin', bitcoinRouter);
		app.use('/api/maintenance', maintenanceRouter);

		// Error handling
		app.use((req, res, next) => {
			const error = new HttpError(404, 'Not Found');
			next(error);
		});

		app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
			logError(error);
			const status = error instanceof HttpError ? error.status : 500;
			return res.status(status).json({
				error: errorToString(error),
			});
		});

		const server = app.listen(PORT, HOST, () => {
			logMessage(`wsn-backend is listening on ${HOST}:${PORT}!`);
		});

		const shutdown = () => {
			logMessage('Shutting down. Closing connections.');
			server.close(() => {
				logMessage('Shutting down. Connections closed.');
				process.exit();
			});
		};

		process.on('SIGINT', shutdown);
		process.on('SIGTERM', shutdown);
	} catch (e) {
		logError(e);
		process.exit(1);
	}
};

main();
