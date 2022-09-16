import React, { FC } from 'react';

interface IMoonDesktopProps {
	color?: string;
	size: number;
}

export const MoonDesktop: FC<IMoonDesktopProps> = (props) => {
	return (
		<svg width={31} height={30} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<g clipPath="url(#prefix__clip0_1706:3777)">
				<path
					d="M29.373 19.291c-.29-.124-.606-.096-.901.052a11.257 11.257 0 01-3.684 1.436c-1.247.27-2.57.293-3.935.077a11.28 11.28 0 01-7.366-4.505 11.28 11.28 0 01-2.011-8.397 11.82 11.82 0 011.187-3.58 10.301 10.301 0 012.335-2.97.98.98 0 00.064-1.388c-.235-.232-.526-.356-.842-.328-3.358.362-6.468 1.851-8.884 4.11A15.133 15.133 0 00.83 12.406c-.654 4.13.42 8.145 2.716 11.305 2.297 3.16 5.746 5.414 9.914 6.074 3.486.55 6.899-.152 9.793-1.753a15.125 15.125 0 006.617-7.458c.236-.507.017-1.085-.496-1.283z"
					fill={props.color ?? '#1D1D1D'}
				/>
			</g>
			<defs>
				<clipPath id="prefix__clip0_1706:3777">
					<path fill="#fff" transform="translate(.604)" d="M0 0h30v30H0z" />
				</clipPath>
			</defs>
		</svg>
	);
};
