import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { Input } from 'components/form/input/input';
import { Icon } from 'components/icon/icon';
import { Modal } from 'components/modal/modal';
import { CoinsList } from 'pages/exchange/coinsList/coinsList';
import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { Popover } from 'react-tiny-popover';
import { ISwapToken } from 'types';
import { currencyFmt } from 'utils/currencyFmt';
import { useDevice } from 'utils/useDevice';
import './Coin.scss';

interface ICoinProps {
	className?: string;
	label: string;
	token?: ISwapToken;
	value: string;
	isDarkTheme: boolean;
	coins: Array<ISwapToken>;
	onChangeText?: (value: string) => void;
	onCoinSelect: (coin: ISwapToken) => void;
}

export const Coin: FC<ICoinProps> = ({
	className,
	label,
	token,
	value,
	isDarkTheme,
	coins,
	onChangeText,
	onCoinSelect,
}) => {
	const { isDesktop, isMobile } = useDevice();
	const [isCoinsListOpen, setIsCoinsListOpen] = useState(false);
	const [isCoinPopoverOpen, setIsCoinPopoverOpen] = useState(false);

	const valueUsd = useMemo(() => {
		let valueUsd = '';
		if (token && token.priceInUsd !== undefined) {
			const numberedValue = new BigNumber(value);
			if (numberedValue.isFinite()) {
				valueUsd = numberedValue.times(token.priceInUsd).toString();
			}
			return valueUsd;
		}
	}, [value, token]);

	const handleChangeText = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (onChangeText) {
				onChangeText(event.target.value);
			}
		},
		[onChangeText]
	);

	const handleCoinSelect = useCallback(
		(coin: ISwapToken) => {
			onCoinSelect(coin);
			setIsCoinPopoverOpen(false);
			setIsCoinsListOpen(false);
		},
		[onCoinSelect, setIsCoinPopoverOpen, setIsCoinsListOpen]
	);

	const handleOpenCoinsList = useCallback(() => {
		if (isDesktop) {
			setIsCoinPopoverOpen(true);
		} else {
			setIsCoinsListOpen(true);
		}
	}, [isDesktop, setIsCoinPopoverOpen, setIsCoinsListOpen]);

	const handleCloseCoinsList = useCallback(() => {
		setIsCoinPopoverOpen(false);
		setIsCoinsListOpen(false);
	}, [setIsCoinPopoverOpen, setIsCoinsListOpen]);

	return (
		<>
			<div className={clsx('Coin', className, isDarkTheme && 'Coin--dark')}>
				<div className="Coin__label">{label}</div>
				<div className="Coin__wrapper">
					<div className="Coin__wrapper-top">
						<small className={clsx(isDarkTheme && 'Coin__wrapper-top--dark')}>{token?.name ?? ''}</small>
						<small className={clsx(isDarkTheme && 'Coin__wrapper-top--dark')}>~{currencyFmt(Number(valueUsd))}</small>
					</div>
					<div className="Coin__wrapper-bottom">
						<Popover
							isOpen={isCoinPopoverOpen}
							positions={['bottom', 'right', 'left', 'top']}
							content={<CoinsList coins={coins} onCoinSelect={handleCoinSelect} inPopover={true} />}
							onClickOutside={handleCloseCoinsList}
						>
							<div className="Coin__wrapper-bottom-selector" onClick={handleOpenCoinsList}>
								{token && (
									<img
										className="Coin__wrapper-bottom-selector-image"
										src={token.logoUri}
										alt={token.symbol}
										onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
									/>
								)}
								<span className="Coin__wrapper-bottom-selector-unit">{token?.symbol ?? ''}</span>
								<Icon className="Coin__wrapper-bottom-selector-down" name="chevron-tiny-down" />
							</div>
						</Popover>
						{onChangeText ? (
							<div className="Coin__wrapper-bottom-input-wrapper">
								<Input
									value={value}
									onChange={handleChangeText}
									className="Coin__wrapper-bottom-input"
									id="from-coin-input"
								/>
							</div>
						) : (
							<span className="Coin__wrapper-bottom-value">{value}</span>
						)}
					</div>
				</div>
			</div>
			{isMobile && (
				<Modal heading="Coins" isOpen={isCoinsListOpen} close={handleCloseCoinsList}>
					<CoinsList coins={coins} inPopover={false} onCoinSelect={handleCoinSelect} />
				</Modal>
			)}
		</>
	);
};
