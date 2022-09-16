import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Icon } from 'components/icon/icon';
import { Qr } from 'components/qr/qr';
import { ThemeIcon } from 'components/themeIcon/themeIcon';
import copy from 'copy-to-clipboard';
import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import { getBitcoinKeys, getEthereumKeys } from 'utils/crypto';
import { isBitcoinChain, isEthereumChain } from 'utils/utils';
import './ReceiveCoin.scss';

interface IReceiveCoin {
	unit: string;
	onBackClick: () => void;
}

export const ReceiveCoin: FC<IReceiveCoin> = ({ unit, onBackClick }) => {
	const { mnemonic } = useSelector((state: IRootState) => state.user);
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { chain } = useSelector((state: IRootState) => state.network);

	const { address } = useMemo(() => {
		if (isEthereumChain(chain)) {
			return getEthereumKeys(mnemonic);
		} else if (isBitcoinChain(chain)) {
			return getBitcoinKeys(mnemonic);
		}
		return { address: '' };
	}, [mnemonic, chain]);

	const shareCode = () =>
		navigator
			.share({
				title: 'WallStreetNinja',
				text: address,
			})
			.then(() => {
				console.log('Shared!');
			})
			.catch((err) => {
				console.log('Error when sharing!');
			});

	return (
		<DashboardLayout withNav={false} className={clsx('ReceiveCoin', isDarkTheme && 'ReceiveCoin--dark')}>
			<header className="ReceiveCoin__header">
				<Icon className="ReceiveCoin__header-back" name="chevron-left" onClick={onBackClick} />
				Receive {unit}
			</header>
			<div className="ReceiveCoin__card">
				<h3 className="ReceiveCoin__card-title">WallStreetNinja</h3>
				<Qr className="ReceiveCoin__card-qr" code={address} width={238} isDarkTheme={isDarkTheme} />
				<small className="ReceiveCoin__card-code">{address}</small>
			</div>
			<p className="ReceiveCoin__warning">
				Send only <span className="ReceiveCoin__warning-unit">{unit}</span> to this address. Sending any other coins may
				result in permanent loss.
			</p>
			<div className="ReceiveCoin__actions">
				<ThemeIcon className="ReceiveCoin__actions-icon" name="clone" onClick={() => copy(address)} />
				{!!navigator.share && <ThemeIcon className="ReceiveCoin__actions-icon" name="share" onClick={shareCode} />}
			</div>
		</DashboardLayout>
	);
};
