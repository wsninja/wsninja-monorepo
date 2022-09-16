import clsx from 'clsx';
import { Icon } from 'components/icon/icon';
import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { INotification } from 'types';
import { markNotificationRead } from 'utils/notification';
import './Notification.scss';

interface INotificationProps {
	notification: INotification;
}

export const Notification: FC<INotificationProps> = ({ notification }) => {
	const history = useHistory();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { securityToken } = useSelector((state: IRootState) => state.user);

	useEffect(() => {
		if (securityToken) {
			markNotificationRead(notification.id, securityToken);
		}
	}, [notification, securityToken]);

	return (
		<div className={clsx('Notification', isDarkTheme && 'Notification--dark')}>
			<div className="Notification__top">
				<Icon name="chevron-left" className="Notification__top-icon" onClick={() => history.goBack()} />
				{notification.heading}
			</div>
			<p className="Notification__description">{notification.description}</p>
		</div>
	);
};
