import {
	addNotification as db_addNotification,
	deleteNotification as db_deleteNotification,
	getNotifications as db_getNotifications,
	markAllNotificationsRead as db_markAllNotificationsRead,
	markNotificationRead as db_markNotificationRead,
} from 'db/notification';
import { getUserIdOrThrow } from 'db/user';
import { Request, Response } from 'express';
import { parseSignedRequest, sendResponse } from 'utils/utils';

interface IAddNotificationRequest {
	heading: string;
	description: string;
	metadata: string;
}

interface IAddNotificationResponse {
	notificationId: bigint;
}

export const addNotification = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { heading, description, metadata },
	} = parseSignedRequest<IAddNotificationRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	const notificationId = await db_addNotification(userId, heading, description, metadata);
	return sendResponse<IAddNotificationResponse>(res, { notificationId });
};

interface IMarkNotificationReadRequest {
	notificationId: bigint;
}

export const markNotificationRead = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { notificationId },
	} = parseSignedRequest<IMarkNotificationReadRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	await db_markNotificationRead(userId, notificationId);
	return sendResponse(res, undefined);
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
	const { publicKey } = parseSignedRequest(req);
	const userId = await getUserIdOrThrow(publicKey);
	await db_markAllNotificationsRead(userId);
	return sendResponse(res, undefined);
};

interface IDeleteNotificationsRequest {
	notificationIds: Array<bigint>;
}

export const deleteNotifications = async (req: Request, res: Response) => {
	const {
		publicKey,
		payload: { notificationIds },
	} = parseSignedRequest<IDeleteNotificationsRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	for (const notificationId of notificationIds) {
		await db_deleteNotification(userId, notificationId);
	}
	return sendResponse(res, undefined);
};

interface IGetNotificationsResponse {
	notifications: Array<{
		id: bigint;
		heading: string;
		description: string;
		metadata: string;
		isRead: boolean;
		createdAt: Date;
	}>;
}

export const getNotifications = async (req: Request, res: Response) => {
	const { publicKey } = parseSignedRequest(req);
	const userId = await getUserIdOrThrow(publicKey);
	const notifications = await db_getNotifications(userId);
	return sendResponse<IGetNotificationsResponse>(res, { notifications });
};
