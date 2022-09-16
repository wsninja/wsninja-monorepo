import { openDb } from 'db/db';
import { cleanEthereumAddress } from 'utils/base';

export const addCustomToken = async (
	userId: bigint,
	chainId: bigint,
	address: string,
	name: string,
	symbol: string,
	logoUri: string
) => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`INSERT OR IGNORE INTO "custom_tokens" (
				"user_id",
				"chain_id",
				"address",
				"name",
				"symbol",
				"logo_uri"
			) VALUES (
				$user_id,
				$chain_id,
				$address,
				$name,
				$symbol,
				$logo_uri
			)`,
			{
				$user_id: userId.toString(),
				$chain_id: chainId.toString(),
				$address: cleanEthereumAddress(address),
				$name: name,
				$symbol: symbol,
				$logo_uri: logoUri,
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

export const getCustomTokens = async (
	userId: bigint
): Promise<Array<{ chainId: bigint; address: string; name: string; symbol: string; logoUri: string }>> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`SELECT
				"chain_id",
				"address",
				"name",
				"symbol",
				"logo_uri"
			FROM "custom_tokens"
			WHERE "user_id" = $user_id`,
			{ $user_id: userId.toString() }
		);
		try {
			const result = await stmt.all<
				Array<{ chain_id: string; address: string; name: string; symbol: string; logo_uri: string }>
			>();
			return result.map(({ chain_id, address, name, symbol, logo_uri }) => ({
				chainId: BigInt(chain_id),
				address,
				name,
				symbol,
				logoUri: logo_uri,
			}));
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};

export const addWatchedToken = async (userId: bigint, symbol: string) => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`INSERT OR IGNORE INTO "watched_tokens" (
				"user_id",
				"symbol"
			) VALUES (
				$user_id,
				$symbol
			)`,
			{
				$user_id: userId.toString(),
				$symbol: symbol.toLowerCase(),
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

export const deleteWatchedToken = async (userId: bigint, symbol: string) => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`DELETE FROM "watched_tokens"
			WHERE "user_id" = $user_id AND "symbol" = $symbol`,
			{ $user_id: userId.toString(), $symbol: symbol.toLowerCase() }
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

export const getWatchedTokens = async (userId: bigint): Promise<Array<{ symbol: string }>> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`SELECT "symbol"
			FROM "watched_tokens"
			WHERE "user_id" = $user_id`,
			{ $user_id: userId.toString() }
		);
		try {
			const result = await stmt.all<Array<{ symbol: string }>>();
			return result.map(({ symbol }) => ({ symbol }));
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};

export const addHiddenToken = async (userId: bigint, chainId: bigint, address: string) => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`INSERT OR IGNORE INTO "hidden_tokens" (
				"user_id",
				"chain_id",
				"address"
			) VALUES (
				$user_id,
				$chain_id,
				$address
			)`,
			{
				$user_id: userId.toString(),
				$chain_id: chainId.toString(),
				$address: cleanEthereumAddress(address),
			}
		);
		try {
			const { lastID, changes } = await stmt.run();
			if (lastID === undefined || changes === undefined || changes < 1) {
				throw new Error('Unable to add hidden token');
			}
			return BigInt(lastID);
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};

export const deleteHiddenToken = async (userId: bigint, chainId: bigint, address: string) => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`DELETE FROM "hidden_tokens"
			WHERE "user_id" = $user_id AND "chain_id" = $chain_id AND "address" = $address`,
			{ $user_id: userId.toString(), $chain_id: chainId.toString(), $address: cleanEthereumAddress(address) }
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

export const getHiddenTokens = async (userId: bigint): Promise<Array<{ chainId: bigint; address: string }>> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`SELECT "chain_id", "address"
			FROM "hidden_tokens"
			WHERE "user_id" = $user_id`,
			{ $user_id: userId.toString() }
		);
		try {
			const result = await stmt.all<Array<{ chain_id: string; address: string }>>();
			return result.map(({ chain_id, address }) => ({ chainId: BigInt(chain_id), address }));
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};
