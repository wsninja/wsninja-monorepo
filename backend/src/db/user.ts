import { openDb } from 'db/db';
import { cleanEthereumAddress, cleanPublicKey } from 'utils/base';

export const addUser = async (publicKey: string, address: string): Promise<bigint | undefined> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`INSERT OR IGNORE INTO "users" (
				"address",
				"public_key",
				"ask_password_on_transaction",
				"is_session_timeout",
				"created_at"
			) VALUES (
				$address,
				$public_key,
				1,
				1,
				$created_at
			)`,
			{
				$address: cleanEthereumAddress(address),
				$public_key: cleanPublicKey(publicKey),
				$created_at: new Date().toISOString(),
			}
		);
		try {
			const { lastID, changes } = await stmt.run();
			if (lastID !== undefined && changes !== undefined && changes > 0) {
				return BigInt(lastID);
			}
			return undefined;
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};

export const getUserId = async (publicKey: string): Promise<bigint | undefined> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`SELECT "id"
			FROM "users"
			WHERE "public_key" = $public_key`,
			{ $public_key: cleanPublicKey(publicKey) }
		);
		try {
			const result = await stmt.get<{ id: string }>();
			if (!result) {
				return undefined;
			}
			const { id } = result;
			return BigInt(id);
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};

export const getUserIdOrThrow = async (publicKey: string): Promise<bigint> => {
	const userId = await getUserId(publicKey);
	if (userId === undefined) {
		throw new Error('Unknown user');
	}
	return userId;
};

export const setAskPasswordOnTransaction = async (publicKey: string, value: boolean) => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`UPDATE "users"
			SET "ask_password_on_transaction" = $ask_password_on_transaction
			WHERE "public_key" = $public_key`,
			{
				$ask_password_on_transaction: value ? 1 : 0,
				$public_key: cleanPublicKey(publicKey),
			}
		);
		try {
			await stmt.run();
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};

export const setIsSessionTimeout = async (publicKey: string, value: boolean) => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`UPDATE "users"
			SET "is_session_timeout" = $is_session_timeout
			WHERE "public_key" = $public_key`,
			{
				$is_session_timeout: value ? 1 : 0,
				$public_key: cleanPublicKey(publicKey),
			}
		);
		try {
			await stmt.run();
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};

export const getUserSettings = async (
	publicKey: string
): Promise<
	| {
			askPasswordOnTransaction: boolean;
			isSessionTimeout: boolean;
	  }
	| undefined
> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`SELECT "ask_password_on_transaction", "is_session_timeout"
			FROM "users"
			WHERE "public_key" = $public_key`,
			{ $public_key: cleanPublicKey(publicKey) }
		);
		try {
			const result = await stmt.get<{ ask_password_on_transaction: string; is_session_timeout: string }>();
			if (!result) {
				return undefined;
			}
			const { ask_password_on_transaction, is_session_timeout } = result;
			return {
				askPasswordOnTransaction: Boolean(BigInt(ask_password_on_transaction)),
				isSessionTimeout: Boolean(BigInt(is_session_timeout)),
			};
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};
