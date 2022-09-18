import React, { FC } from 'react';

interface IDexDesktopProps {
	color?: string;
	size: number;
}

export const DexDesktop: FC<IDexDesktopProps> = (props) => {
	return (
		<svg width={30} height={28} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				d="M5.431 11.656a.938.938 0 001.325 0l1.213-1.212a.938.938 0 000-1.325L6.756 7.906h16.681a2.815 2.815 0 012.813 2.813c0 .775.631 1.406 1.406 1.406h.938c.775 0 1.406-.631 1.406-1.406a6.57 6.57 0 00-6.563-6.563H6.758l1.212-1.212a.938.938 0 000-1.325L6.756.406a.938.938 0 00-1.325 0L.137 5.7a.47.47 0 000 .663l5.294 5.293zM24.569 16.344a.938.938 0 00-1.325 0l-1.213 1.212a.936.936 0 000 1.325l1.213 1.213H6.563A2.816 2.816 0 013.75 17.28c0-.775-.631-1.406-1.406-1.406h-.938c-.775 0-1.406.631-1.406 1.406a6.57 6.57 0 006.563 6.563h16.68l-1.212 1.212a.936.936 0 000 1.325l1.213 1.213a.938.938 0 001.325 0l5.294-5.294a.47.47 0 000-.663l-5.294-5.293z"
				fill={props.color ?? '#fff'}
			/>
		</svg>
	);
};