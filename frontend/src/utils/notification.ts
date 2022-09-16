import { updateNotifications } from 'store/notification/actions';
import { store } from 'store/store';
import {
	addNotification as api_addNotification,
	deleteNotifications as api_deleteNotifications,
	getNotifications as api_getNotifications,
	markAllNotificationsRead as api_markAllNotificationsRead,
	markNotificationRead as api_markNotificationRead,
} from 'utils/api/api';
import { IAddNotificationRequest } from 'utils/api/types';

export const getNotifications = async (securityToken: string) => {
	const { notifications } = await api_getNotifications(securityToken);
	store.dispatch(updateNotifications(notifications));
};

export const addNotification = async (notification: IAddNotificationRequest, securityToken: string) => {
	await api_addNotification(notification, securityToken);
	await getNotifications(securityToken);
};

export const markNotificationRead = async (notificationId: bigint, securityToken: string) => {
	await api_markNotificationRead({ notificationId }, securityToken);
	await getNotifications(securityToken);
};

export const markAllNotificationsRead = async (securityToken: string) => {
	await api_markAllNotificationsRead(securityToken);
	await getNotifications(securityToken);
};

export const deleteNotifications = async (notificationIds: Array<bigint>, securityToken: string) => {
	await api_deleteNotifications({ notificationIds }, securityToken);
	await getNotifications(securityToken);
};
