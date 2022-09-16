import React, { FC } from 'react';

interface INotificationDesktopProps {
	color?: string;
	size: number;
}

export const NotificationDesktop: FC<INotificationDesktopProps> = (props) => {
	return (
		<svg width={26} height={34} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M23.003 14.917v8.333l2.15 2.15c1.05 1.05.3 2.85-1.184 2.85H2.02c-1.483 0-2.216-1.8-1.166-2.85l2.15-2.15v-8.333c0-5.134 2.716-9.4 7.5-10.534V3.25c0-1.383 1.116-2.5 2.5-2.5 1.383 0 2.5 1.117 2.5 2.5v1.133c4.766 1.134 7.5 5.417 7.5 10.534zm-6.667 15c0 1.833-1.5 3.333-3.333 3.333-1.85 0-3.334-1.5-3.334-3.333h6.667z"
				fill={props.color ?? '#fff'}
			/>
		</svg>
	);
};
