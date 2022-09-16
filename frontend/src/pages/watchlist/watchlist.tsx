import tetherIcon from 'assets/images/tether.png';
import clsx from 'clsx';
import { TextButton } from 'components/button/textButton';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Icon } from 'components/icon/icon';
import { Modal } from 'components/modal/modal';
import { AllConversions } from 'pages/watchlist/allConversions/allConversions';
import { Chart } from 'pages/watchlist/chart/chart';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CoinList } from 'store/conversions/CoinList';
import { IConversion, updateWatchlist } from 'store/conversions/conversions';
import { IRootState } from 'store/store';
import { getTokenPrice, getWatchedTokens } from 'utils/api/api';
import { currencyFmt } from 'utils/currencyFmt';
import { useDevice } from 'utils/useDevice';
import './Watchlist.scss';

export const Watchlist: FC = () => {
	const { isDesktop } = useDevice();
	const dispatch = useDispatch();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { watchlist } = useSelector((state: IRootState) => state.conversions);
	const { securityToken } = useSelector((state: IRootState) => state.user);
	const [initilising, setInitilising] = useState(true);
	const [selectedConversion, setSelectedConversion] = useState<IConversion | undefined>(undefined);
	const [isModalVisible, setIsModalVisible] = useState(false);

	const isInWatchlist = useCallback(
		(conversion: IConversion) =>
			!!watchlist.find((conv) => conv.to.unit === conversion.to.unit && conv.from.unit === conversion.from.unit),
		[watchlist]
	);

	useEffect(() => {
		if (initilising) {
			(async () => {
				let tmpWatchlist = watchlist;
				if (tmpWatchlist.length === 0) {
					const { watchedTokens } = await getWatchedTokens(securityToken);
					tmpWatchlist = CoinList.filter((conversion) =>
						watchedTokens.find(({ symbol }) => symbol === conversion.from.unit.toLowerCase())
					);
				}
				const newWatchlist = new Array<IConversion>();
				for (const conversion of tmpWatchlist) {
					const { tokenPrice } = await getTokenPrice({ tokenSymbol: conversion.from.unit }, securityToken);
					if (tokenPrice) {
						const { priceChangePercentage24h, price, logoUri, priceLow24h, priceHigh24h } = tokenPrice;
						const tempConversion: IConversion = {
							...conversion,
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
						newWatchlist.push(tempConversion);
					} else {
						const tempConversion: IConversion = {
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
						newWatchlist.push(tempConversion);
					}
				}
				dispatch(updateWatchlist(newWatchlist));
				setInitilising(false);
			})();
		}
	});

	useEffect(() => {
		if (watchlist.length === 0) {
			setSelectedConversion(undefined);
		} else if (selectedConversion === undefined || !isInWatchlist(selectedConversion)) {
			setSelectedConversion(watchlist[0]);
		}
	}, [setSelectedConversion, selectedConversion, watchlist, isInWatchlist]);

	const handleShowModal = useCallback(() => {
		if (!initilising) {
			setIsModalVisible(true);
		}
	}, [initilising, setIsModalVisible]);

	if (isDesktop) {
		return (
			<DashboardLayout>
				<div className={clsx('DesktopWatchlist', isDarkTheme && 'DesktopWatchlist--dark')}>
					<div className="DesktopWatchlist__header">
						<div className="DesktopWatchlist__header-content">
							<h1 className="DesktopWatchlist__header-content-heading">Watchlist</h1>
							<div className="DesktopWatchlist__actions">
								<Icon className="Watchlist__header-plus" name="plus" onClick={handleShowModal} />
							</div>
						</div>
					</div>
					<div className="DesktopWatchlist__grid">
						<div className="DesktopWatchlist__chart-container">
							{selectedConversion && <Chart conversion={selectedConversion} />}
						</div>
						<div className="DesktopWatchlist__list">
							{watchlist.map((conversion, index) => (
								<div
									className="DesktopWatchlist__list-card"
									key={index}
									onClick={() => setSelectedConversion(conversion)}
								>
									<div className="DesktopWatchlist__list-card-images">
										<img
											className="DesktopWatchlist__list-card-images-to"
											src={conversion.to.image}
											alt={conversion.to.name}
										/>
										<img
											className="DesktopWatchlist__list-card-images-from"
											src={conversion.from.image}
											alt={conversion.from.name}
											onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
										/>
									</div>
									<div className="DesktopWatchlist__list-card-content">
										<div className="DesktopWatchlist__list-card-content-top">
											<h3 className="DesktopWatchlist__list-card-content-top-unit">
												{conversion.from.unit}
												{conversion.to.unit}
											</h3>
											{conversion.from.price === undefined ? (
												<div className="DesktopWatchlist__list-card-content-top-notListed">
													*not listed on Coingecko
												</div>
											) : (
												<h3 className="DesktopWatchlist__list-card-content-top-value">
													{currencyFmt(conversion.from.price)}
												</h3>
											)}
										</div>
										<div className="DesktopWatchlist__list-card-content-bottom">
											<span className="DesktopWatchlist__list-card-content-bottom-name">
												{conversion.from.name} / {conversion.to.name}
											</span>
											<span>
												{conversion.from.price !== undefined && conversion.from.change !== null && (
													<span
														className={clsx(
															'DesktopWatchlist__list-card-content-bottom-change',
															conversion.from.change < 0 &&
																'DesktopWatchlist__list-card-content-bottom-change--negative'
														)}
													>
														{conversion.from.change > 0 && '+'}
														{conversion.from.change}%
													</span>
												)}
											</span>
										</div>
									</div>
								</div>
							))}
							<TextButton type="primary" text="Edit" onClick={handleShowModal} fullWidth />
						</div>
					</div>
				</div>

				<Modal heading="Add Symbol" isOpen={isModalVisible} close={() => setIsModalVisible(false)}>
					<AllConversions />
				</Modal>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout className={clsx('Watchlist', isDarkTheme && 'Watchlist--dark')}>
			<header className="Watchlist__header">
				<span className="Watchlist__header-title">Watchlist</span>
				<Icon className="Watchlist__header-plus" name="plus" onClick={handleShowModal} />
			</header>
			<div className="Watchlist__list">
				{watchlist.map((conversion) => (
					<div className="Watchlist__list-card">
						<div className="Watchlist__list-card-images">
							<img className="Watchlist__list-card-images-to" src={conversion.to.image} alt={conversion.to.name} />
							<img
								className="Watchlist__list-card-images-from"
								src={conversion.from.image}
								alt={conversion.from.name}
								onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
							/>
						</div>
						<div className="Watchlist__list-card-content">
							<div className="Watchlist__list-card-content-top">
								<h3 className="Watchlist__list-card-content-top-unit">
									{conversion.from.unit}
									{conversion.to.unit}
								</h3>
								{conversion.from.price === undefined ? (
									<div className="Watchlist__list-card-content-top-notListed">*not listed on Coingecko</div>
								) : (
									<h3 className="Watchlist__list-card-content-top-value">{currencyFmt(conversion.from.price)}</h3>
								)}
							</div>
							<div className="Watchlist__list-card-content-bottom">
								<span className="Watchlist__list-card-content-bottom-name">
									{conversion.from.name} / {conversion.to.name}
								</span>
								<span>
									{conversion.from.price !== undefined && conversion.from.change !== null && (
										<span
											className={clsx(
												'Watchlist__list-card-content-bottom-change',
												conversion.from.change < 0 && 'Watchlist__list-card-content-bottom-change--negative'
											)}
										>
											{conversion.from.change > 0 && '+'}
											{conversion.from.change}%
										</span>
									)}
								</span>
							</div>
						</div>
					</div>
				))}
				<TextButton type="primary" text="Edit" onClick={handleShowModal} fullWidth />
			</div>

			<Modal heading="Add Symbol" isOpen={isModalVisible} close={() => setIsModalVisible(false)}>
				<AllConversions />
			</Modal>
		</DashboardLayout>
	);
};
