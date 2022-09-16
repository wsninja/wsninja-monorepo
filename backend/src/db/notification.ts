import { openDb } from 'db/db';

export const addNotification = async (
	userId: bigint,
	heading: string,
	description: string,
	metadata: string
): Promise<bigint> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`INSERT INTO "notifications" (
				"user_id",
				"heading",
				"description",
				"metadata",
				"is_read",
				"is_deleted",
				"created_at"
			) VALUES (
				$user_id,
				$heading,
				$description,
				$metadata,
				false,
				false,
				$created_at
			)`,
			{
				$user_id: userId.toString(),
				$heading: heading,
				$description: description,
				$metadata: metadata,
				$created_at: new Date().toISOString(),
			}
		);
		try {
			const { lastID, changes } = await stmt.run();
			if (lastID === undefined || changes === undefined || changes < 1) {
				throw new Error('Unable to add notification');
			}
			return BigInt(lastID);
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};

export const markNotificationRead = async (userId: bigint, notificationId: bigint): Promise<void> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`UPDATE "notifications"
			SET "is_read" = true
			WHERE "id" = $id AND "user_id" = $user_id AND "is_deleted" = false`,
			{ $id: notificationId.toString(), $user_id: userId.toString() }
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

export const markAllNotificationsRead = async (userId: bigint): Promise<void> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`UPDATE "notifications"
			SET "is_read" = true
			WHERE "user_id" = $user_id AND "is_deleted" = false`,
			{ $user_id: userId.toString() }
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

export const deleteNotification = async (userId: bigint, notificationId: bigint): Promise<void> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`UPDATE "notifications"
			SET "is_deleted" = true
			WHERE "id" = $id AND "user_id" = $user_id`,
			{ $id: notificationId.toString(), $user_id: userId.toString() }
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

export const getNotifications = async (
	userId: bigint
): Promise<
	Array<{ id: bigint; heading: string; description: string; metadata: string; isRead: boolean; createdAt: Date }>
> => {
	const db = await openDb();
	try {
		const stmt = await db.prepare(
			`SELECT
				"id",
				"heading",
				"description",
				"metadata",
				"is_read",
				"created_at"
			FROM "notifications" 
			WHERE "user_id" = $user_id AND "is_deleted" = false`,
			{ $user_id: userId.toString() }
		);
		try {
			const results = await stmt.all<
				Array<{
					id: string;
					heading: string;
					description: string;
					metadata: string;
					is_read: string;
					created_at: string;
				}>
			>();
			return results.map(({ id, heading, description, metadata, is_read, created_at }) => ({
				id: BigInt(id),
				heading,
				description,
				metadata,
				isRead: Boolean(BigInt(is_read)),
				createdAt: new Date(created_at),
			}));
		} finally {
			await stmt.finalize();
		}
	} finally {
		await db.close();
	}
};
