import React, { FC } from 'react';

interface IWalletDesktopProps {
	color?: string;
	size: number;
}

export const WalletDesktop: FC<IWalletDesktopProps> = (props) => {
	return (
		<svg width={37} height={30} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				d="M26.512 9.767h9.767V5.233A5.238 5.238 0 0031.047 0H5.233A5.238 5.238 0 000 5.233v19.534A5.238 5.238 0 005.233 30h25.814a5.238 5.238 0 005.232-5.233v-4.534h-9.767A5.238 5.238 0 0121.279 15a5.238 5.238 0 015.233-5.233z"
				fill={props.color ?? '#fff'}
			/>
			<path
				d="M26.512 11.86a3.143 3.143 0 00-3.14 3.14 3.143 3.143 0 003.14 3.14h9.767v-6.28h-9.767zm1.395 4.186h-1.395a1.047 1.047 0 010-2.093h1.395a1.047 1.047 0 010 2.093z"
				fill={props.color ?? '#fff'}
			/>
		</svg>
	);
};
