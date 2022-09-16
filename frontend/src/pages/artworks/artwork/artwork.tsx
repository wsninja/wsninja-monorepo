import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Button } from 'components/form/button/button';
import { Icon } from 'components/icon/icon';
import { Loader } from 'components/loader/loader';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { useDevice } from 'utils/useDevice';
import './Artwork.scss';

interface IArtwork {
	id: number;
	name: string;
	image: string;
	description: string;
	lastBid: {
		value: number;
		unit: string;
	};
}

export const Artwork: FC = () => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const [artwork, setArtwork] = useState<IArtwork | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				setArtwork({
					id: 1,
					name: 'Nyan Cat',
					image: 'https://via.placeholder.com/250',
					description:
						'Nyan Cat turns 10 this year, and to mark the occasion, a one-of-a-kind edition of the iconic GIF is going up for auction. Chris Torres, the artist behind Nyan Cat, has remastered the original animation and will be selling it through the crypto art platform Foundation. The auction begins at 1PM ET today and will run for around 24 hours.',
					lastBid: {
						value: 32,
						unit: 'ETH',
					},
				});
			} catch (err) {
				console.log(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	if (isLoading || !artwork) {
		return <Loader />;
	}

	if (isDesktop) {
		return (
			<div className={clsx('DesktopArtwork', isDarkTheme && 'DesktopArtwork--dark')}>
				<div className="DesktopArtwork__header">
					<h3>Collectible Detail</h3>
					<Icon className="DesktopArtwork__header-icon" name="close" onClick={() => history.push('/artworks')} />
				</div>
				<div className="DesktopArtwork__grid">
					<div className="DesktopArtwork__grid-left">
						<img src={artwork.image} alt={artwork.name} />
					</div>
					<div className="DesktopArtwork__grid-right">
						<h2 className="DesktopArtwork__grid-right-name">{artwork.name}</h2>
						<p className="DesktopArtwork__grid-right-desc">{artwork.description}</p>
					</div>
				</div>
				<div className="DesktopArtwork__bid">
					Last Bid: {artwork.lastBid.value}
					{artwork.lastBid.unit}
				</div>
				<Button variant="solid" color="primary" size="lg" isDarkTheme={isDarkTheme} className="DesktopArtwork__cta">
					Send
				</Button>
			</div>
		);
	}

	return (
		<DashboardLayout withNav={false} className={clsx('Artwork', isDarkTheme && 'Artwork--dark')}>
			<header className="Artwork__header">
				<Icon className="Artwork__header-back" name="chevron-left" onClick={() => history.push(`/artworks`)} />
				Collectible Detail
			</header>
			<div className="Artwork__main">
				<img className="Artwork__img" src={artwork.image} alt={artwork.name} />
				<div className="Artwork__price">
					Last Bid -{' '}
					<span className="Artwork__price-value">
						{artwork.lastBid.value} {artwork.lastBid.unit}
					</span>
				</div>
				<Button variant="solid" color="primary" className="Artwork__cta">
					<Icon className="Artwork__cta-icon" name="upload" />
					Send
				</Button>
				<h3 className="Artwork__name">{artwork.name}</h3>
				<p className="Artwork__description">{artwork.description}</p>
			</div>
		</DashboardLayout>
	);
};
