import BrandLogoGifImage from 'assets/images/brand-logo.gif';
import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { HomeLayout } from 'components/homeLayout/homeLayout';
import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { useDevice } from 'utils/useDevice';
import './Home.scss';

export const Home: FC = () => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const { isAuthenticated, encryptedMnemonic } = useSelector((state: IRootState) => state.user);
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	useEffect(() => {
		if (isAuthenticated) {
			history.push('/home');
		}
	}, [isAuthenticated, history]);

	if (isDesktop) {
		return (
			<HomeLayout>
				<div className={clsx('DesktopHome', isDarkTheme && 'DesktopHome--dark')}>
					<div className="DesktopHome__card">
						<h1 className="DesktopHome__brand">WallStreetNinja</h1>
						<h6 className="DesktopHome__tagline">The Unstoppable Finance Suite</h6>
						<div className="Home__gif-container">
							<img alt="WallStreetNinja" className="Home__gif" src={BrandLogoGifImage} />
						</div>
						<p className="DesktopHome__paragraph">
							{/* The Wall Street Ninja Suite (WSNS) is an easy to use
                     platform to access a range of decentralized finance
                     products across multiple blockchain networks. This service
                     is completely non-custodial and WSNS does not have access
                     to your funds. */}
							Welcome to the WallStreetNinja Alpha Release version.
							<br />
							<span style={{ color: 'var(--color-primary)' }}>WARNING: </span>This is an Alpha Release which may or may
							not
							<br />
							function as expected.
							<br />
							Use for testing purposes only at your own risk.
						</p>
						<div className="DesktopHome__actions">
							<Button
								className="DesktopHome__actions-cta"
								variant="solid"
								color="primary"
								onClick={() => history.push('/register')}
								size="lg"
								isDarkTheme={isDarkTheme}
							>
								Create new account
							</Button>
							<Button
								className="DesktopHome__actions-cta"
								variant="outline"
								color="primary"
								onClick={() => history.push('/restore-account')}
								size="lg"
								isDarkTheme={isDarkTheme}
							>
								Restore account
							</Button>
						</div>
					</div>
				</div>
			</HomeLayout>
		);
	}

	return (
		<HomeLayout>
			<main className={clsx('Home', isDarkTheme && 'Home--dark')}>
				<h1 className="Home__brand">WallStreetNinja</h1>
				<h6 className="Home__tagline">The Unstoppable Finance Suite</h6>
				<div className="Home__gif-container">
					<img alt="WallStreetNinja" className="Home__gif" src={BrandLogoGifImage} />
				</div>
				<p className="Home__paragraph">
					The Wall Street Ninja (WSN) is an easy to use platform to access a range of decentralized finance products
					across multiple blockchain networks. This service is completely non-custodial and WSN does not have access to
					your funds.
				</p>
				<div className="Home__actions">
					<Button
						className="Home__actions-cta"
						variant="solid"
						color="primary"
						onClick={() => history.push('/register')}
					>
						Create new account
					</Button>
					<Button
						className="Home__actions-cta"
						variant="outline"
						color="primary"
						onClick={() => history.push('/restore-account')}
					>
						Restore account
					</Button>
					{encryptedMnemonic && (
						<Button
							className="Home__actions-cta"
							variant="outline"
							color="primary"
							onClick={() => history.push('/login')}
						>
							Login
						</Button>
					)}
				</div>
			</main>
		</HomeLayout>
	);
};
