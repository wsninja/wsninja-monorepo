import tetherIcon from 'assets/images/tether.png';
import clsx from 'clsx';
import { Input } from 'components/form/input/input';
import { Icon } from 'components/icon/icon';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToWatchlist, IConversion, removeFromWatchlist } from 'store/conversions/conversions';
import { IRootState } from 'store/store';
import { addWatchedToken, deleteWatchedToken, getTokenPrice } from 'utils/api/api';
import './AllConversions.scss';

interface IAllConversionsProps {
	close?: () => void;
}

export const AllConversions: FC<IAllConversionsProps> = ({ close }) => {
	const dispatch = useDispatch();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { watchlist, conversions } = useSelector((state: IRootState) => state.conversions);
	const { securityToken } = useSelector((state: IRootState) => state.user);
	const [filteredList, setFilteredList] = useState(conversions);
	const [query, setQuery] = useState('');
	const [prevWatchlist] = useState(watchlist);

	useEffect(() => {
		if (query) {
			const term = query.toLowerCase();
			setFilteredList(
				conversions.filter(
					(c) =>
						c.to.name.toLowerCase().includes(term) ||
						c.to.unit.toLowerCase().includes(term) ||
						c.from.unit.toLowerCase().includes(term) ||
						c.from.name.toLowerCase().includes(term)
				)
			);
		} else {
			setFilteredList(conversions);
		}
	}, [query, setFilteredList, conversions]);

	const isInWatchlist = useCallback(
		(conversion: IConversion) =>
			!!watchlist.find((conv) => conv.to.unit === conversion.to.unit && conv.from.unit === conversion.from.unit),
		[watchlist]
	);

	const isInPrevWatchlist = useCallback(
		(conversion: IConversion) =>
			!!prevWatchlist.find((conv) => conv.to.unit === conversion.to.unit && conv.from.unit === conversion.from.unit),
		[prevWatchlist]
	);

	const handleAction = async (conversion: IConversion) => {
		if (isInWatchlist(conversion)) {
			dispatch(removeFromWatchlist({ conversion }));
			await deleteWatchedToken({ tokenSymbol: conversion.from.unit }, securityToken);
		} else {
			const { tokenPrice } = await getTokenPrice({ tokenSymbol: conversion.from.unit }, securityToken);
			if (tokenPrice) {
				const { priceChangePercentage24h, price, logoUri, priceLow24h, priceHigh24h } = tokenPrice;
				let tempConversion: IConversion = {
					from: {
						...conversion.from,
						price,
						change: priceChangePercentage24h,
						priceLow24h,
						priceHigh24h,
						image: logoUri,
					},
					to: {
						name: 'TetherUS',
						unit: 'USDT',
						change: 0,
						image: tetherIcon,
					},
				};
				dispatch(addToWatchlist(tempConversion));
				await addWatchedToken({ tokenSymbol: conversion.from.unit }, securityToken);
			} else {
				let tempConversion: IConversion = {
					...conversion,
					from: {
						...conversion.from,
						image: '',
					},
					to: {
						name: 'TetherUS',
						unit: 'USDT',
						change: 0,
						image: tetherIcon,
					},
				};
				dispatch(addToWatchlist(tempConversion));
				await addWatchedToken({ tokenSymbol: conversion.from.unit }, securityToken);
			}
		}
	};

	return (
		<div className={clsx('AllConversions', isDarkTheme && 'AllConversions--dark')}>
			<div className="AllConversions__header">
				<Input
					placeholder="Search"
					className="AllConversions__header-input"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
			</div>
			<div className="AllConversions__list">
				{filteredList.map((conv, index) => {
					const _isInWatchlist = isInWatchlist(conv);
					const _isInPrevWatchlist = isInPrevWatchlist(conv);
					return (
						<div
							className={clsx(
								'AllConversions__list-item',
								_isInWatchlist && _isInPrevWatchlist
									? 'AllConversions__list-item-in'
									: _isInWatchlist && !_isInPrevWatchlist
									? 'AllConversions__list-item-added'
									: !_isInWatchlist && _isInPrevWatchlist
									? 'AllConversions__list-item-removed'
									: ''
							)}
							key={index}
							onClick={() => handleAction(conv)}
						>
							<h3 className="AllConversions__list-item-text">{conv.from.unit + conv.to.unit}</h3>
							<h3 className="AllConversions__list-item-text">{conv.from.name + ' / ' + conv.to.name}</h3>
							<Icon name={_isInWatchlist ? 'close' : 'plus'} className="AllConversions__list-item-icon" />
						</div>
					);
				})}
			</div>
		</div>
	);
};
