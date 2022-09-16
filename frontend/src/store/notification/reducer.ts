import { INotificationAction, INotificationState } from 'store/notification/types';

export const initialNotificationState: INotificationState = {
	notifications: [],
};

export const notificationReducer = (
	state = initialNotificationState,
	action: INotificationAction
): INotificationState => {
	switch (action.type) {
		case 'updateNotifications':
			return {
				...state,
				notifications: action.payload.notifications,
			};
		default:
			return state;
	}
};
