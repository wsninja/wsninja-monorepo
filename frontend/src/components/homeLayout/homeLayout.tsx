import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { Icon } from 'components/icon/icon';
import { SocialMediaIcons } from 'components/socialMediaIcons/socialMediaIcons';
import React, { FC, ReactNode, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { IRootState } from 'store/store';
import { toggle } from 'store/theme/theme';
import { useDevice } from 'utils/useDevice';
import './HomeLayout.scss';

interface IHomeLayoutPorps {
	children?: ReactNode;
}

export const HomeLayout: FC<IHomeLayoutPorps> = ({ children }) => {
	const { pathname } = useLocation();
	const history = useHistory();
	const { isDesktop } = useDevice();
	const dispatch = useDispatch();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { encryptedMnemonic } = useSelector((state: IRootState) => state.user);

	const handleChangeDarkMode = useCallback(() => dispatch(toggle()), [dispatch]);

	if (isDesktop) {
		return (
			<div className={clsx('DesktopHomeLayout', isDarkTheme && 'DesktopHomeLayout--dark')}>
				<nav className="DesktopHomeLayout__nav">
					<h1 className="DesktopHomeLayout__nav-brand" onClick={() => history.push('/')}>
						WallStreetNinja
					</h1>
					<div className="DesktopHomeLayout__nav-list">
						<Link className="DesktopHomeLayout__nav-list-item" to="/register">
							Create Account
						</Link>
						<Link className="DesktopHomeLayout__nav-list-item" to="/restore-account">
							Restore or Import
						</Link>
						{encryptedMnemonic && (
							<Link className="DesktopHomeLayout__nav-list-item" to="/login">
								Login
							</Link>
						)}
					</div>
					<Icon
						className="DesktopHomeLayout__nav-icon"
						name={isDarkTheme ? 'moon' : 'sun'}
						onClick={handleChangeDarkMode}
						size={24}
					/>
				</nav>
				<main className="DesktopHomeLayout__main">{children}</main>
				<footer className="DesktopHomeLayout__footer">
					<SocialMediaIcons className="DesktopHomeLayout__footer-social-icons" />
					<Button variant="ghost" isDarkTheme={isDarkTheme} size="lg">
						English
					</Button>
				</footer>
			</div>
		);
	}

	return (
		<div className={clsx('HomeLayout', isDarkTheme && 'HomeLayout--dark')}>
			{pathname !== '/login' && (
				<div className={clsx('HomeLayout__top-bar', pathname === '/' && 'HomeLayout__top-bar--end')}>
					{pathname !== '/' && (
						<Icon className="HomeLayout__back-icon" name="chevron-left" onClick={() => history.goBack()} />
					)}
					<Button isDarkTheme={isDarkTheme}>English</Button>
				</div>
			)}
			{children}
			<footer className="HomeLayout__footer">
				<SocialMediaIcons className="HomeLayout__footer-social-icons" />
			</footer>
		</div>
	);
};
