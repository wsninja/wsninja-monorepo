import BrandLogoGifImage from 'assets/images/brand-logo.gif';
import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { SocialMediaIcons } from 'components/socialMediaIcons/socialMediaIcons';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import { useDevice } from 'utils/useDevice';
import './DashboardHome.scss';

export const DashboardHome: FC = () => {
	const { isDesktop } = useDevice();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	if (isDesktop) {
		return (
			<DashboardLayout>
				<div className={clsx('DesktopDashboardHome', isDarkTheme && 'DesktopDashboardHome--dark')}>
					<div className="DesktopDashboardHome__card">
						<h1 className="DesktopDashboardHome__heading">
							Welcome
							<br /> <span>WallStreetNinja</span> User!
						</h1>
						<div className="DesktopDashboardHome__logo-container">
							<img className="DesktopDashboardHome__logo" src={BrandLogoGifImage} alt="WSN" />
						</div>
						<h2 className="DesktopDashboardHome__tagline">The Unstoppable Finance Suite</h2>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout className={clsx('DashboardHome', isDarkTheme && 'DashboardHome--dark')}>
			<h1 className="DashboardHome__heading">
				Welcome
				<br /> WallStreetNinja
				<br /> User!
			</h1>
			<div className="DashboardHome__logo-container">
				<img className="DashboardHome__logo" src={BrandLogoGifImage} alt="WSN" />
			</div>
			<h1 className="DashboardHome__tagline">
				The <br />
				Unstoppable
				<br /> Finance Suite
			</h1>
			<SocialMediaIcons className="DashboardHome__social" />
		</DashboardLayout>
	);
};
