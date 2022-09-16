import { IPayloadAction } from 'store/types';
import { INotification } from 'types';

export interface INotificationState {
	notifications: Array<INotification>;
}

type IUpdateNotifications = IPayloadAction<'updateNotifications', { notifications: Array<INotification> }>;

export type INotificationAction = IUpdateNotifications;
