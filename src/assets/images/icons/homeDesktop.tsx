import React, { FC } from 'react';

interface IHomeDesktopProps {
	color?: string;
	size: number;
}

export const HomeDesktop: FC<IHomeDesktopProps> = (props) => {
	return (
		<svg width={34} height={30} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				d="M12.965 28.199v-9.007h7.205V28.2c0 .99.81 1.801 1.801 1.801h5.404c.991 0 1.802-.81 1.802-1.801v-12.61h3.062c.828 0 1.225-1.026.594-1.566L17.775.459a1.815 1.815 0 00-2.414 0L.302 14.023c-.612.54-.234 1.567.595 1.567h3.062v12.609c0 .99.81 1.801 1.801 1.801h5.404c.99 0 1.801-.81 1.801-1.801z"
				fill={props.color ?? '#fff'}
			/>
		</svg>
	);
};
