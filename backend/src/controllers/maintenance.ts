import { DB_PATH } from 'constants/env';
import { createDatabaseBackup, disableDatabase, enableDatabase } from 'db/db';
import { Request, Response } from 'express';
import { readFileSync, rmSync, writeFileSync } from 'fs';
import { parseRequest, sendResponse, throwIfNotAdminPassword } from 'utils/utils';

export const health = async (req: Request, res: Response) => {
	return res.json({ message: "I'm well!" });
};

interface IGetDatabaseRequest {
	password: string;
}

interface IGetDatabaseResponse {
	file: string;
}

export const getDatabase = async (req: Request, res: Response) => {
	const {
		payload: { password },
	} = parseRequest<IGetDatabaseRequest>(req);
	throwIfNotAdminPassword(password);
	const backupPath = await createDatabaseBackup();
	if (!backupPath) {
		throw new Error('Database does not exist.');
	}
	const content = readFileSync(backupPath);
	return sendResponse<IGetDatabaseResponse>(res, { file: content.toString('base64') });
};

interface ISetDatabaseRequest {
	password: string;
	file: string;
}

export const setDatabase = async (req: Request, res: Response) => {
	const {
		payload: { password, file },
	} = parseRequest<ISetDatabaseRequest>(req);
	throwIfNotAdminPassword(password);
	disableDatabase();
	await createDatabaseBackup();
	rmSync(DB_PATH, { force: true, maxRetries: 100, recursive: true });
	rmSync(`${DB_PATH}-wal`, { force: true, maxRetries: 100, recursive: true });
	writeFileSync(DB_PATH, Buffer.from(file, 'base64'));
	enableDatabase();
	return sendResponse(res, undefined);
};
