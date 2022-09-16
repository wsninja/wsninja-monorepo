import {
	addNotification,
	deleteNotifications,
	getNotifications,
	markAllNotificationsRead,
	markNotificationRead,
} from 'controllers/notification';
import { AsyncRouter } from 'express-async-router';

export const notificationRouter = AsyncRouter();

notificationRouter.post('/addNotification', addNotification);
notificationRouter.post('/markNotificationRead', markNotificationRead);
notificationRouter.post('/markAllNotificationsRead', markAllNotificationsRead);
notificationRouter.post('/deleteNotifications', deleteNotifications);
notificationRouter.post('/getNotifications', getNotifications);
