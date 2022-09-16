import { INotificationAction } from 'store/notification/types';
import { INotification } from 'types';

export const updateNotifications = (notifications: Array<INotification>): INotificationAction => ({
	type: 'updateNotifications',
	payload: { notifications },
});
