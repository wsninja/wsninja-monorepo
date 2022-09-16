import ToastCheck from 'assets/images/toast-check.svg';
import clsx from 'clsx';
import { networks } from 'constants/networks';
import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import { IChain } from 'types';
import './WsnToast.scss';

interface IWsnToastProps {
	chain: IChain;
	heading: string;
	message: string;
	url?: string;
}

export const WsnToast: FC<IWsnToastProps> = ({ chain, heading, message, url }) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const explorerName = useMemo<string>(() => {
		const network = networks.find((network) => network.chain === chain);
		if (network) {
			return network.explorerName;
		}
		return '';
	}, [chain]);

	return (
		<div className={clsx('WsnToast', isDarkTheme && 'WsnToast--dark')}>
			<img width="24px" height="24px" src={ToastCheck} alt="Success" />
			<div className="WsnToast__body">
				<h3 className="WsnToast__heading">{heading}</h3>
				<p className="WsnToast__message">{message}</p>
				{!!url && (
					<a className="WsnToast__link" href={url} target="_blank" rel="noreferrer noopener">
						View on {explorerName}
					</a>
				)}
			</div>
		</div>
	);
};
