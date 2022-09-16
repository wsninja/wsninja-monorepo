import { exec } from 'child_process';
import { DB_PATH } from 'constants/env';
import { existsSync } from 'fs';
import { Database, open } from 'sqlite';
import sqlite3, { OPEN_CREATE, OPEN_READWRITE } from 'sqlite3';
import { errorToString } from 'utils/base';

let databaseDisabled = false;

export const enableDatabase = () => (databaseDisabled = false);

export const disableDatabase = () => (databaseDisabled = true);

export const existsDb = () => existsSync(DB_PATH);

export const openDb = async (create = false): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
	if (databaseDisabled) {
		throw new Error('Database is in maintenance.');
	}
	const db = await open({
		filename: DB_PATH,
		driver: sqlite3.Database,
		mode: create ? OPEN_CREATE | OPEN_READWRITE : OPEN_READWRITE,
	});
	await db.run('PRAGMA journal_mode = WAL;');
	await db.run('PRAGMA busy_timeout = 30000'); // If the database is locked, it waits for 30000 ms until SQLITE_BUSY is thrown
	return db;
};

export const initDb = async () => {
	const db = await openDb(true);
	try {
		await db.exec(`
			CREATE TABLE "users" (
				"id" INTEGER NOT NULL UNIQUE,
				"address" TEXT NOT NULL UNIQUE,
				"public_key" TEXT NOT NULL UNIQUE,
				"ask_password_on_transaction" INTEGER NOT NULL,
				"is_session_timeout" INTEGER NOT NULL,
				"created_at" TEXT NOT NULL,
				PRIMARY KEY("id" AUTOINCREMENT)
			)`);

		await db.exec(`
			CREATE TABLE "notifications" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"heading" TEXT NOT NULL,
				"description" TEXT NOT NULL,
				"metadata" TEXT NOT NULL,
				"is_read" INTEGER NOT NULL,
				"is_deleted" INTEGER NOT NULL,
				"created_at" TEXT NOT NULL,
				PRIMARY KEY("id" AUTOINCREMENT)
				FOREIGN KEY("user_id") REFERENCES users("id")
			)`);

		await db.exec(`
			CREATE TABLE "custom_tokens" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"chain_id" INTEGER NOT NULL,
				"address" TEXT NOT NULL,
				"name" TEXT NOT NULL,
				"symbol" TEXT NOT NULL,
				"logo_uri" TEXT NOT NULL,
				PRIMARY KEY("id" AUTOINCREMENT)
				FOREIGN KEY("user_id") REFERENCES users("id")
				UNIQUE("user_id", "chain_id", "address")
			)`);

		await db.exec(`
			CREATE TABLE "watched_tokens" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"symbol" TEXT NOT NULL,
				PRIMARY KEY("id" AUTOINCREMENT)
				UNIQUE("user_id", "symbol")
			)`);

		await db.exec(`
			CREATE TABLE "hidden_tokens" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"chain_id" INTEGER NOT NULL,
				"address" TEXT NOT NULL,
				PRIMARY KEY("id" AUTOINCREMENT)
				FOREIGN KEY("user_id") REFERENCES users("id")
				UNIQUE("user_id", "chain_id", "address")
			)`);
	} finally {
		await db.close();
	}
};

export const createDatabaseBackup = async (): Promise<string | undefined> => {
	if (!existsSync(DB_PATH)) {
		return undefined;
	}
	let backupPath = '';
	do {
		backupPath = `${DB_PATH}.${new Date().toISOString()}`;
	} while (existsSync(backupPath));
	await new Promise<void>((resolve, reject) => {
		exec(`sqlite3 ${DB_PATH} ".backup '${backupPath}'"`, (error, stdout, stderr) => {
			if (error) {
				reject(new Error(errorToString(error)));
			}
			resolve();
		});
	});
	return backupPath;
};
