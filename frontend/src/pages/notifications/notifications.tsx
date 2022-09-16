import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Checkbox } from 'components/form/checkbox/checkbox';
import { Icon } from 'components/icon/icon';
import { Loader } from 'components/loader/loader';
import { Notification } from 'pages/notifications/notification/notification';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { IRootState } from 'store/store';
import { INotification } from 'types';
import {
	deleteNotifications,
	getNotifications,
	markAllNotificationsRead,
	markNotificationRead,
} from 'utils/notification';
import { useDevice } from 'utils/useDevice';
import './Notifications.scss';

export const Notifications: FC = () => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const { notificationId } = useParams<{ notificationId?: string }>();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { notifications } = useSelector((state: IRootState) => state.notification);
	const { securityToken } = useSelector((state: IRootState) => state.user);
	const [fetchedNotification, setFetchedNotification] = useState<INotification | undefined>(undefined);
	const [selected, setSelected] = useState<Array<bigint>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedNotification, setSelectedNotification] = useState<INotification | undefined>(undefined);
	const [notificationOrder, setNotificationOrder] = useState<'asc' | 'desc'>('desc');
	const [isSelectAll, setIsSelectAll] = useState(false);

	useEffect(() => {
		if (securityToken) {
			getNotifications(securityToken);
		}
	}, [securityToken]);

	useEffect(() => {
		if (selectedNotification && securityToken) {
			markNotificationRead(selectedNotification.id, securityToken);
		}
	}, [selectedNotification, securityToken]);

	useEffect(() => {
		try {
			if (notificationId && !isDesktop) {
				// fetch single notification
				const foundNotification = notifications.find((n) => n.id.toString() === notificationId);
				setFetchedNotification(foundNotification);
			} else {
				// fetch all notifications
				// dispatch from here after fetching
			}
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
		}
	}, [notificationId, isDesktop, notifications]);

	const orderedNotifications = useMemo(() => {
		const tmpOrderedNotifications = [...notifications];
		if (notificationOrder === 'asc') {
			tmpOrderedNotifications.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
		} else {
			tmpOrderedNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		}
		return tmpOrderedNotifications;
	}, [notifications, notificationOrder]);

	const handleMarkAllNotificationsRead = useCallback(() => {
		if (securityToken) {
			markAllNotificationsRead(securityToken);
		}
	}, [securityToken]);

	const handleDeleteNotifications = useCallback(() => {
		if (securityToken) {
			deleteNotifications(selected, securityToken);
		}
	}, [securityToken, selected]);

	const toggleCheckbox = useCallback(
		(touchedId: bigint) => {
			const index = selected.findIndex((id) => id === touchedId);
			const updatedSelected = [...selected];
			if (~index) {
				updatedSelected.splice(index, 1);
			} else {
				updatedSelected.push(touchedId);
			}
			setSelected(updatedSelected);
		},
		[selected]
	);

	const toggleSelectAll = useCallback(() => {
		if (isSelectAll) {
			setSelected([]);
			setIsSelectAll(false);
		} else {
			setSelected(orderedNotifications.map(({ id }) => id));
			setIsSelectAll(true);
		}
	}, [isSelectAll, orderedNotifications]);

	if (isDesktop) {
		return (
			<DashboardLayout>
				{isLoading ? (
					<Loader />
				) : (
					<div className={clsx('DesktopNotifications', isDarkTheme && 'DesktopNotifications--dark')}>
						<div className="DesktopNotifications__actions">
							<Icon
								title="Select/deselect all"
								name="check-square"
								className="DesktopNotifications__actions-icon"
								onClick={toggleSelectAll}
							/>
							<Icon
								title="Mark all notifications read"
								name="check-double"
								className="DesktopNotifications__actions-icon"
								onClick={handleMarkAllNotificationsRead}
							/>
							<Icon
								title="Delete selected notifications"
								name="trash"
								className="DesktopNotifications__actions-icon"
								onClick={handleDeleteNotifications}
							/>
							{notificationOrder === 'asc' ? (
								<Icon
									title="Sort descending"
									name="chevron-down"
									className="DesktopNotifications__actions-icon"
									onClick={() => setNotificationOrder('desc')}
								/>
							) : (
								<Icon
									title="Sort ascending"
									name="chevron-up"
									className="DesktopNotifications__actions-icon"
									onClick={() => setNotificationOrder('asc')}
								/>
							)}
						</div>
						<div className="DesktopNotifications__grid">
							<div className="DesktopNotifications__selected">
								{selectedNotification ? (
									<>
										<h3 className="DesktopNotifications__selected-heading">{selectedNotification.heading}</h3>
										<p className="DesktopNotifications__selected-description">{selectedNotification.description}</p>
										<p className="DesktopNotifications__selected-description">{selectedNotification.metadata}</p>
									</>
								) : (
									<h3> No notification selected. </h3>
								)}
							</div>
							<div className="DesktopNotifications__list">
								{orderedNotifications.map((notification) => (
									<div
										className="DesktopNotifications__list-card"
										key={notification.id.toString()}
										role="button"
										tabIndex={0}
										onClick={() => {
											setSelectedNotification(notification);
											toggleCheckbox(notification.id);
										}}
									>
										<div className="DesktopNotifications__list-card-top">
											<span
												className={clsx(
													'DesktopNotifications__list-card-top-blinker',
													notification.isRead && 'DesktopNotifications__list-card-top-blinker--read'
												)}
											/>
											{notification.heading}
										</div>
										<div className="DesktopNotifications__list-card-bottom">
											<Checkbox
												className="DesktopNotifications__list-card-bottom-checkbox"
												checked={selected.includes(notification.id)}
												onChange={() => toggleCheckbox(notification.id)}
												onClick={(e) => e.stopPropagation()}
											/>
											{notification.description}
										</div>
										<div className="DesktopNotifications__list-card-time">
											{notification.createdAt.toLocaleString()}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</DashboardLayout>
		);
	}

	if (isLoading) {
		return <Loader />;
	}
	if (notificationId && fetchedNotification) {
		return <Notification notification={fetchedNotification} />;
	}
	return (
		<div className={clsx('Notifications', isDarkTheme && 'Notifications--dark')}>
			<div className="Notifications__top">
				<Icon name="chevron-left" className="Notifications__top-icon" onClick={() => history.goBack()} />
				<div className="Notifications__actions">
					<Icon
						title="Select/deselect all"
						name="check-square"
						className="Notifications__actions-icon"
						onClick={toggleSelectAll}
					/>
					<Icon
						title="Mark all notifications read"
						name="check-double"
						className="Notifications__actions-icon"
						onClick={handleMarkAllNotificationsRead}
					/>
					<Icon
						title="Delete selected notifications"
						name="trash"
						className="Notifications__actions-icon"
						onClick={handleDeleteNotifications}
					/>
					{notificationOrder === 'asc' ? (
						<Icon
							title="Sort descending"
							name="chevron-down"
							className="Notifications__actions-icon"
							onClick={() => setNotificationOrder('desc')}
						/>
					) : (
						<Icon
							title="Sort ascending"
							name="chevron-up"
							className="Notifications__actions-icon"
							onClick={() => setNotificationOrder('asc')}
						/>
					)}
				</div>
			</div>
			<div className="Notifications__list">
				{orderedNotifications.map((notification) => (
					<div
						className="Notifications__list-card"
						key={notification.id.toString()}
						role="button"
						tabIndex={0}
						onClick={() => history.push(`/notifications/${notification.id}`)}
					>
						<div className="Notifications__list-card-top">
							<span
								className={clsx(
									'Notifications__list-card-top-blinker',
									notification.isRead && 'Notifications__list-card-top-blinker--read'
								)}
							/>
							{notification.heading}
						</div>
						<div className="Notifications__list-card-bottom">
							<Checkbox
								className="Notifications__list-card-bottom-checkbox"
								checked={selected.includes(notification.id)}
								onChange={() => toggleCheckbox(notification.id)}
								onClick={(e) => e.stopPropagation()}
							/>
							{notification.description}
						</div>
						<div className="Notifications__list-card-time">{notification.createdAt.toLocaleString()}</div>
					</div>
				))}
			</div>
		</div>
	);
};
