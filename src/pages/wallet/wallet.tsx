import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { ISelectOption, Select } from 'components/form/select/select';
import { Icon } from 'components/icon/icon';
import { Tabs } from 'components/tabs/tabs';
import { ThemeIcon } from 'components/themeIcon/themeIcon';
import { Coins } from 'pages/wallet/coins/coins';
import { Collectibles } from 'pages/wallet/collectibles/collectibles';
import { ICoinTab, IHistoryFilter } from 'pages/wallet/types';
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { IRootState } from 'store/store';
import { useTheme } from 'styled-components';
import { capitalize } from 'utils/capitalize';
import { useDevice } from 'utils/useDevice';
import './Wallet.scss';

const TABS = ['Coins'];
const COINS_TABS: Array<ICoinTab> = ['History', 'Send', 'Receive'];
const HISTORY_OPTIONS: Array<{ value: IHistoryFilter; title: string }> = [
	{ value: 'all', title: 'All' },
	{ value: 'received', title: 'Received' },
	{ value: 'sent', title: 'Sent' },
	{ value: 'exchanged', title: 'Exchange' },
	{ value: 'call', title: 'Smart Contract Call' },
];

interface IWalletProps {
	children?: ReactNode;
}

export const Wallet: FC<IWalletProps> = ({ children }) => {
	const { tab } = useParams<{ tab: string }>();
	const history = useHistory();
	const { isDesktop } = useDevice();
	const { pathname } = useLocation();
	const theme = useTheme();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const currentTab = pathname.includes('/wallet/coins') ? 'Coins' : 'Collectibles';

	const [currentCoinTab, setCurrentCoinTab] = useState<ICoinTab>(COINS_TABS[0]);
	const [historyFilter, setHistoryFilter] = useState<ISelectOption>(HISTORY_OPTIONS[0]);
	const [showTokenSelector, setShowTokenSelector] = useState(false);

	useEffect(() => {
		if (pathname === '/wallet') {
			const lowerCasedTabs = TABS.map((el) => el.toLowerCase());
			if (!tab || !lowerCasedTabs.length || !lowerCasedTabs.includes(tab)) {
				history.push(`/wallet/${lowerCasedTabs[0]}`);
			}
		}
	}, [history, tab, pathname]);

	const renderContent = useMemo(() => {
		if (pathname.includes('/artworks')) {
			return <Collectibles children={children} />;
		}

		switch (tab) {
			case 'coins':
				return (
					<Coins
						currentTab={currentCoinTab}
						historyFilter={historyFilter.value as IHistoryFilter}
						showTokenSelector={showTokenSelector}
						onCloseTokenSelector={() => setShowTokenSelector(false)}
					/>
				);
			case 'collectibles':
				return <Collectibles children={children} />;
			default:
				return null;
		}
	}, [pathname, children, currentCoinTab, historyFilter, tab, showTokenSelector]);

	if (isDesktop) {
		return (
			<DashboardLayout>
				<div className="DesktopWallet">
					<div className="DesktopWallet__header">
						<Tabs
							options={TABS}
							current={currentTab}
							onTabChange={(newTab) => history.push(`/wallet/${newTab.toLowerCase()}`)}
							isDarkTheme={isDarkTheme}
						>
							<Icon
								name="bookmark"
								size={20}
								onClick={() => setShowTokenSelector(!showTokenSelector)}
								color={theme.color.primary}
							/>
						</Tabs>
						{currentTab === 'Coins' && (
							<div className="DesktopWallet__header-coins">
								<Select
									options={HISTORY_OPTIONS}
									onChange={(option) => setHistoryFilter(option)}
									current={historyFilter}
									isDarkTheme={isDarkTheme}
								/>
								<Tabs
									options={COINS_TABS}
									current={currentCoinTab}
									onTabChange={(newTab) => setCurrentCoinTab(newTab as ICoinTab)}
									isDarkTheme={isDarkTheme}
								/>
							</div>
						)}
					</div>
					{renderContent}
				</div>
			</DashboardLayout>
		);
	}

	if (showTokenSelector) {
		return (
			<Coins
				currentTab={currentCoinTab}
				historyFilter={historyFilter.value as IHistoryFilter}
				showTokenSelector={showTokenSelector}
				onCloseTokenSelector={() => setShowTokenSelector(false)}
			/>
		);
	}

	return (
		<DashboardLayout className="Wallet">
			<header className="Wallet__header">
				<Tabs
					options={TABS}
					current={capitalize(tab)}
					onTabChange={(newTab) => history.push(`/wallet/${newTab.toLowerCase()}`)}
					isDarkTheme={isDarkTheme}
				/>
				<div className="Wallet__header-actions">
					{/* <ThemeIcon
                  className="Wallet__header-actions-icon"
                  name="upload"
                  size={20}
               />
               <ThemeIcon
                  className="Wallet__header-actions-icon"
                  name="download"
                  size={20}
               /> */}
					<ThemeIcon
						className="Wallet__header-actions-icon"
						name="bookmark"
						size={20}
						onClick={() => setShowTokenSelector(!showTokenSelector)}
					/>
				</div>
			</header>
			{renderContent}
		</DashboardLayout>
	);
};
