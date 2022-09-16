import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { Switch } from 'components/form/swtich/switch';
import { Icon } from 'components/icon/icon';
import { NetworkButton } from 'components/networkButton/networkButton';
import { SocialMediaIcons } from 'components/socialMediaIcons/socialMediaIcons';
import { WalletConnectButton } from 'components/walletConnectButton/walletConnectButton';
import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { IRootState } from 'store/store';
import { toggle } from 'store/theme/theme';
import { logout } from 'store/user/actions';
import { useDevice } from 'utils/useDevice';
import './DashboardLayout.scss';
import { Sidebar } from './Sidebar/sidebar';

interface IDashboardLayoutProps {
	children?: ReactNode;
	className?: string;
	withNav?: boolean;
}

export const DashboardLayout: FC<IDashboardLayoutProps> = ({ className, children, withNav = true }) => {
	const { pathname } = useLocation();
	const history = useHistory();
	const { isDesktop } = useDevice();
	const dispatch = useDispatch();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { notifications } = useSelector((state: IRootState) => state.notification);

	const notificationsCount = notifications.filter((n) => !n.isRead).length;

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	useEffect(() => {
		setIsSidebarOpen(false);
	}, [pathname]);

	const getIconColor = useCallback(
		(icon: 'bell' | 'home' | 'wallet' | 'apps' | 'exchange' | 'cog' | 'moon' | 'sun' | 'bars') => {
			const charcoal = '#1D1D1D';
			const red = '#CC1F1F';
			const white = '#FFFFFF';

			if (isDesktop) {
				switch (icon) {
					case 'bell': {
						if (pathname.startsWith('/notifications')) {
							return isDarkTheme ? charcoal : red;
						} else {
							return isDarkTheme ? white : charcoal;
						}
					}
					case 'home': {
						if (pathname.startsWith('/home')) {
							return isDarkTheme ? charcoal : red;
						} else {
							return isDarkTheme ? white : charcoal;
						}
					}
					case 'wallet': {
						if (/^\/wallet|\/artworks|\/coin/.test(pathname)) {
							return isDarkTheme ? charcoal : red;
						} else {
							return isDarkTheme ? white : charcoal;
						}
					}
					case 'apps': {
						if (pathname.startsWith('/apps')) {
							return isDarkTheme ? charcoal : red;
						} else {
							return isDarkTheme ? white : charcoal;
						}
					}
					case 'exchange': {
						if (pathname.startsWith('/exchange')) {
							return isDarkTheme ? charcoal : red;
						} else {
							return isDarkTheme ? white : charcoal;
						}
					}
					case 'cog': {
						if (pathname.startsWith('/settings')) {
							return isDarkTheme ? charcoal : red;
						} else {
							return isDarkTheme ? white : charcoal;
						}
					}
					case 'moon':
						return charcoal;
					case 'sun':
						return red;
					default:
						return isDarkTheme ? white : charcoal;
				}
			}

			switch (icon) {
				case 'bell':
				case 'bars': {
					return white;
				}
				case 'moon':
					return charcoal;
				case 'sun':
					return white;
				case 'home': {
					if (pathname.startsWith('/home')) {
						return red;
					} else {
						return white;
					}
				}
				case 'wallet': {
					if (/^\/wallet|\/artworks|\/coin/.test(pathname)) {
						return red;
					} else {
						return white;
					}
				}
				case 'apps': {
					if (pathname.startsWith('/apps')) {
						return red;
					} else {
						return white;
					}
				}
				case 'exchange': {
					if (pathname.startsWith('/exchange')) {
						return red;
					} else {
						return white;
					}
				}
				case 'cog': {
					if (pathname.startsWith('/settings')) {
						return red;
					} else {
						return white;
					}
				}
				default:
					return white;
			}
		},
		[isDarkTheme, isDesktop, pathname]
	);

	if (isDesktop) {
		return (
			<div className={clsx('DesktopDashboardLayout', isDarkTheme && 'DesktopDashboardLayout--dark')}>
				{withNav && (
					<nav className="DesktopDashboardLayout__nav">
						<h1 className="DesktopDashboardLayout__nav-brand" onClick={() => history.push('/home')}>
							WallStreetNinja
						</h1>
						<div className="DesktopDashboardLayout__nav-list">
							{/* TODO: notifications popover */}
							<NetworkButton className="DesktopDashboardLayout__nav-list-item" />
							<WalletConnectButton className="DesktopDashboardLayout__nav-list-item" />
							<Link to="/notifications" className={'DesktopDashboardLayout__nav-list-item'}>
								{!!notificationsCount && (
									<span className="DesktopDashboardLayout__nav-list-item-badge">{notificationsCount}</span>
								)}
								<Icon
									className="DesktopDashboardLayout__nav-list-item-icon"
									name="bell"
									size={24}
									color={getIconColor('bell')}
								/>
							</Link>
							<Link to="/home" className={'DesktopDashboardLayout__nav-list-item'}>
								<Icon
									className="DesktopDashboardLayout__nav-list-item-icon"
									name="home"
									size={24}
									color={getIconColor('home')}
								/>
							</Link>
							<Link to="/apps" className={'DesktopDashboardLayout__nav-list-item'}>
								<Icon
									className="DesktopDashboardLayout__nav-list-item-icon"
									name="apps"
									size={24}
									color={getIconColor('apps')}
								/>
							</Link>
							<Link to="/wallet" className={'DesktopDashboardLayout__nav-list-item'}>
								<Icon
									className="DesktopDashboardLayout__nav-list-item-icon"
									name="wallet"
									size={24}
									color={getIconColor('wallet')}
								/>
							</Link>
							<Link to="/exchange" className={'DesktopDashboardLayout__nav-list-item'}>
								<Icon
									className="DesktopDashboardLayout__nav-list-item-icon"
									name="exchange"
									size={24}
									color={getIconColor('exchange')}
								/>
							</Link>
							<Link to="/settings" className={'DesktopDashboardLayout__nav-list-item'}>
								<Icon
									className="DesktopDashboardLayout__nav-list-item-icon"
									name="cog"
									size={24}
									color={getIconColor('cog')}
								/>
							</Link>
							<Icon
								className="DesktopHomeLayout__nav-icon"
								name={isDarkTheme ? 'moon' : 'sun'}
								onClick={() => dispatch(toggle())}
								size={24}
								color={getIconColor(isDarkTheme ? 'moon' : 'sun')}
							/>
						</div>
					</nav>
				)}
				<main className="DesktopDashboardLayout__main">{children}</main>
				<footer className="DesktopDashboardLayout__footer">
					<SocialMediaIcons className="DesktopDashboardLayout__footer-social-icons" />
					<div className="DesktopDashboardLayout__footer-nav">
						<Button
							className="DesktopDashboardLayout__footer-nav-item"
							variant="ghost"
							isDarkTheme={isDarkTheme}
							size="lg"
							onClick={() => history.push('/watchlist')}
						>
							<Icon className="DesktopDashboardLayout__footer-nav-item-icon" name="eye" size={24} />
							Watchlist
						</Button>
						<Button
							className="DesktopDashboardLayout__footer-nav-item"
							variant="ghost"
							isDarkTheme={isDarkTheme}
							size="lg"
							onClick={() => dispatch(logout())}
						>
							<Icon className="DesktopDashboardLayout__footer-nav-item-icon" name="sign-out" size={24} />
							Logout
						</Button>
						<Button
							className="DesktopDashboardLayout__footer-nav-item"
							variant="ghost"
							isDarkTheme={isDarkTheme}
							size="lg"
						>
							English
						</Button>
					</div>
				</footer>
			</div>
		);
	}

	return (
		<div className={clsx('DashboardLayout', className, isDarkTheme && 'DashboardLayout--dark')}>
			{withNav && (
				<nav className="DashboardLayout__nav">
					<div className="DashboardLayout__nav-brand">WSN</div>
					<ul className="DashboardLayout__nav-list">
						<li className="DashboardLayout__nav-list-item">
							<NetworkButton />
						</li>
						<li className="DashboardLayout__nav-list-item">
							<WalletConnectButton />
						</li>
						<li className="DashboardLayout__nav-list-item">
							<Icon
								className="DashboardLayout__nav-list-item-icon"
								name={isDarkTheme ? 'moon' : 'sun'}
								color={getIconColor(isDarkTheme ? 'moon' : 'sun')}
							/>
							<Switch checked={isDarkTheme} onChange={() => dispatch(toggle())} name="theme-toggle" />
						</li>
						<li className="DashboardLayout__nav-list-item">
							<Link to="/notifications">
								{!!notificationsCount && (
									<span className="DashboardLayout__nav-list-item-badge">{notificationsCount}</span>
								)}
								<Icon className="DashboardLayout__nav-list-item-icon" name="bell" color={getIconColor('bell')} />
							</Link>
						</li>
						<li className="DashboardLayout__nav-list-item" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
							<Icon name="bars" color={getIconColor('bars')} />
						</li>
					</ul>
				</nav>
			)}
			<main className={clsx('DashboardLayout__main', withNav && 'DashboardLayout__main--with-nav')}>{children}</main>
			<div className="DashboardLayout__tabs">
				<Link className={'DashboardLayout__tabs-tab'} to="/home">
					<Icon name="home" color={getIconColor('home')} />
				</Link>
				<Link className={'DashboardLayout__tabs-tab'} to="/apps">
					<Icon name="apps" color={getIconColor('apps')} />
				</Link>
				<Link className={'DashboardLayout__tabs-tab'} to="/wallet">
					<Icon name="wallet" color={getIconColor('wallet')} />
				</Link>
				<Link className={'DashboardLayout__tabs-tab'} to="/exchange">
					<Icon name="exchange" color={getIconColor('exchange')} />
				</Link>
				<Link className={'DashboardLayout__tabs-tab'} to="/settings">
					<Icon name="cog" color={getIconColor('cog')} />
				</Link>
			</div>
			<Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(!isSidebarOpen)} />
		</div>
	);
};
