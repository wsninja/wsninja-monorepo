import clsx from 'clsx';
import React, { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import { ISwapToken } from 'types';
import './CoinsList.scss';

interface ICoinsListItemProps {
	coin: ISwapToken;
	onCoinSelect: (coin: ISwapToken) => void;
}

const CoinsListItem: FC<ICoinsListItemProps> = ({ coin, onCoinSelect }) => {
	const handleCoinSelect = useCallback(() => onCoinSelect(coin), [coin, onCoinSelect]);

	return (
		<div className="CoinsList__coin" key={coin.symbol} onClick={handleCoinSelect}>
			<img className="CoinsList__coin-image" src={coin.logoUri} alt={coin.name} loading="lazy" />
			<span className="CoinsList__coin-unit">{coin.symbol}</span>
			<span className="CoinsList__coin-name">{coin.name}</span>
		</div>
	);
};

interface ICoinsListProps {
	coins: Array<ISwapToken>;
	inPopover: boolean;
	onCoinSelect: (coin: ISwapToken) => void;
}

export const CoinsList: FC<ICoinsListProps> = ({ coins, onCoinSelect, inPopover }) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	return (
		<div className={clsx('CoinsList', inPopover && 'CoinsList--popover', isDarkTheme && 'CoinsList--dark')}>
			{coins.map((coin) => (
				<CoinsListItem key={coin.address} coin={coin} onCoinSelect={onCoinSelect} />
			))}
		</div>
	);
};
