import ArweaveImage from 'assets/images/arweave.svg';
import AutofarmImage from 'assets/images/autofarm.svg';
import DYDXImage from 'assets/images/dydx.svg';
import OneInchImage from 'assets/images/one-inch.svg';
import OpenseaImage from 'assets/images/opensea.svg';
import UnicryptImage from 'assets/images/unicrypt.svg';
import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Select } from 'components/form/select/select';
import { Loader } from 'components/loader/loader';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from 'store/store';
import { useDevice } from 'utils/useDevice';
import './Apps.scss';

const OPTIONS = [
	{ value: 'history', title: 'History' },
	{ value: 'new', title: 'New' },
	{ value: 'exchanges', title: 'Exchanges' },
	{ value: 'lending', title: 'Lending' },
	{ value: 'skating', title: 'Skating' },
	{ value: 'yield-farming', title: 'Yield Farming' },
	{ value: 'all', title: 'All' },
];

export const Apps: FC = () => {
	const { isDesktop } = useDevice();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const [apps, setApps] = useState<
		Array<{ id: number; name: string; image: string; description: string; path?: string }>
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [type, setType] = useState(OPTIONS[0]);

	useEffect(() => {
		(async () => {
			try {
				// fetch apps here
				setApps([
					{
						id: 3,
						name: '1inch',
						image: OneInchImage,
						description:
							'DeFi / DEX aggregator with the most liquidity and the best rates on Ethereum and Binance Smart Chain',
						path: '/exchange',
					},
					{
						id: 1,
						name: 'Autofarm',
						image: AutofarmImage,
						description:
							'Cross-chain yield aggregator that enables users to get the return assets from yield farming pools by simply staking in Autofarm vaults.',
					},
					{
						id: 2,
						name: 'Aave',
						image: ArweaveImage,
						description:
							'Aave is an Open Source and Non-Custodial protocol to earn interest on deposits and borrow assets.',
					},

					{
						id: 4,
						name: 'dYdX',
						image: DYDXImage,
						description:
							'Trade Perpetuals on the most powerful open trading platform, backed by @a16z, @polychain, and Three Arrows Capital.',
					},
					{
						id: 5,
						name: 'Unicrypt',
						image: UnicryptImage,
						description:
							'Unicrypt provides an ever-growing suite of decentralized services. The objective is to bring value to the DeFi space as a whole by delivering',
					},
					{
						id: 6,
						name: 'OpenSea',
						image: OpenseaImage,
						description:
							'A peer-to-peer marketplace for rare digital items and crypto collectibles. Buy, sell, auction, and discover CryptoKitties, Decentraland.',
					},
				]);
			} catch (err) {
				console.log(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	if (isDesktop) {
		return (
			<DashboardLayout>
				{isLoading ? (
					<Loader />
				) : (
					<div className={clsx('DesktopApps', isDarkTheme && 'DesktopApps--dark')}>
						<header className="DesktopApps__header">
							<h4 className="DesktopApps__header-heading">Dapps</h4>
							<Select
								className="DesktopApps__header-select"
								current={type}
								options={OPTIONS}
								onChange={({ title, value }) => setType({ title, value: value.toString() })}
								isDarkTheme={isDarkTheme}
							/>
						</header>
						<section className="DesktopApps__list">
							{apps.map(({ id, image, name, description, path }) =>
								path ? (
									<Link key={id} className="DesktopApps__list-link" to={path}>
										<div className="DesktopApps__list-card">
											<div className="DesktopApps__list-card-top">
												<img className="DesktopApps__list-card-top-img" src={image} alt={name} />
												<h3 className="DesktopApps__list-card-top-name">{name}</h3>
											</div>
											<p className="DesktopApps__list-card-description">{description}</p>
										</div>
									</Link>
								) : (
									<div className="DesktopApps__list-card" key={id}>
										<div className="DesktopApps__list-card-top">
											<img className="DesktopApps__list-card-top-img" src={image} alt={name} />
											<h3 className="DesktopApps__list-card-top-name">{name} (coming soon)</h3>
										</div>
										<p className="DesktopApps__list-card-description">{description}</p>
									</div>
								)
							)}
						</section>
					</div>
				)}
			</DashboardLayout>
		);
	}

	if (isLoading) {
		return <Loader />;
	}
	return (
		<DashboardLayout className={clsx('Apps', isDarkTheme && 'Apps--dark')}>
			<header className="Apps__header">
				<h4 className="Apps__header-heading">Dapps</h4>
				<Select
					className="Apps__header-select"
					current={type}
					options={OPTIONS}
					isDarkTheme={isDarkTheme}
					onChange={({ title, value }) => setType({ title, value: value.toString() })}
				/>
			</header>
			<section className="Apps__list">
				{apps.map(({ path, id, name, image, description }) =>
					path ? (
						<Link key={id} className="Apps__list-link" to={path}>
							<div className="Apps__list-card">
								<img className="Apps__list-card-img" src={image} alt={name} />
								<div className="Apps__list-card-content">
									<h3 className="Apps__list-card-content-name">{name}</h3>
									<p className="Apps__list-card-content-description">{description}</p>
								</div>
							</div>
						</Link>
					) : (
						<div className="Apps__list-card" key={id}>
							<img className="Apps__list-card-img" src={image} alt={name} />
							<div className="Apps__list-card-content">
								<h3 className="Apps__list-card-content-name">{name} (coming soon)</h3>
								<p className="Apps__list-card-content-description">{description}</p>
							</div>
						</div>
					)
				)}
			</section>
		</DashboardLayout>
	);
};
