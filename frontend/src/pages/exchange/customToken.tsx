import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { Input } from 'components/form/input/input';
import { Icon } from 'components/icon/icon';
import React, { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';

interface ICustomTokenProps {
	address: string;
	inPopover: boolean;
	onChangeAddress: (address: string) => void;
	onAddCustomToken: (address: string) => void;
}

export const CustomToken: FC<ICustomTokenProps> = ({ address, inPopover, onChangeAddress, onAddCustomToken }) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const handleAddCustomToken = useCallback(() => {
		onAddCustomToken(address);
	}, [address, onAddCustomToken]);

	return (
		<div className={clsx('ExchangeSettings__custom-token', inPopover && 'ExchangeSettings__custom-token--popover')}>
			<h3 className="ExchangeSettings__custom-token-heading">
				<Icon name="warning" /> Warning
			</h3>
			<p className="ExchangeSettings__custom-token-text">
				This token is not Whitelisted on WSN app. By adding it as a custom token, you confirm that all further
				interaction with it are at your own risk
			</p>
			<label className="ExchangeSettings__custom-token-label">Token Address</label>
			<Input
				className="ExchangeSettings__custom-token-input"
				value={address}
				onChange={(e) => onChangeAddress(e.target.value)}
			/>
			<Button
				className="ExchangeSettings__custom-token-btn"
				variant="solid"
				color="primary"
				onClick={handleAddCustomToken}
				size="lg"
				isDarkTheme={isDarkTheme}
			>
				Add Token
			</Button>
		</div>
	);
};
