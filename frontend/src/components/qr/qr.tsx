import clsx from 'clsx';
import QrCode from 'qrcode';
import React, { FC, useEffect, useState } from 'react';

interface IQrProps {
	className?: string;
	code: string;
	width?: number;
	margin?: number;
	isDarkTheme: boolean;
}

export const Qr: FC<IQrProps> = ({ className, code, width = 140, margin = 0, isDarkTheme }) => {
	const [qr, setQr] = useState<JSX.Element>();

	useEffect(() => {
		(async () => {
			try {
				const url = await QrCode.toDataURL(code, {
					color: {
						dark: '#000000',
						light: isDarkTheme ? '#fff' : '#0000',
					},
					width,
					margin,
				});
				setQr(<img alt="QR Code" className={clsx('Qr', className)} src={url} />);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [className, code, width, margin, isDarkTheme]);

	return <>{qr}</>;
};
