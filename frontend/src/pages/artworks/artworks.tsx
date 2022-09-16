import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Icon } from 'components/icon/icon';
import { Loader } from 'components/loader/loader';
import { Artwork } from 'pages/artworks/artwork/artwork';
import { Wallet } from 'pages/wallet/wallet';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { IRootState } from 'store/store';
import { useDevice } from 'utils/useDevice';
import './Artworks.scss';

interface IArtwork {
	id: number;
	image: string;
	name: string;
}

export const Artworks: FC = () => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const { artworkId } = useParams<{ artworkId: string }>();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const [artworks, setArtworks] = useState<Array<IArtwork>>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				setArtworks([
					{
						id: 1,
						image: 'https://via.placeholder.com/100',
						name: 'Nyan Cat',
					},
					{
						id: 2,
						image: 'https://via.placeholder.com/100',
						name: 'Murukami',
					},
					{
						id: 3,
						image: 'https://via.placeholder.com/100',
						name: 'Cryptopunk',
					},
					{
						id: 4,
						image: 'https://via.placeholder.com/100',
						name: 'Crypto kitty',
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
		if (isLoading) {
			return (
				<Wallet>
					<Loader />
				</Wallet>
			);
		}

		if (artworkId) {
			return (
				<Wallet>
					<Artwork />
				</Wallet>
			);
		}

		return (
			<Wallet>
				<div className={clsx('DesktopArtworks', isDarkTheme && 'DesktopArtworks--dark')}>
					{artworks.map((artwork) => (
						<div
							key={artwork.id}
							className="DesktopArtworks__card"
							role="button"
							tabIndex={0}
							onClick={() => history.push(`/artworks/${artwork.id}`)}
						>
							<img className="DesktopArtworks__card-img" src={artwork.image} alt={artwork.name} />
							<h5 className="DesktopArtworks__card-name">{artwork.name}</h5>
						</div>
					))}
				</div>
			</Wallet>
		);
	}

	if (isLoading) {
		return <Loader />;
	}
	if (artworkId) {
		return <Artwork />;
	}
	return (
		<DashboardLayout withNav={false} className={clsx('Artworks', isDarkTheme && 'Artworks--dark')}>
			<header className="Artworks__header">
				<Icon
					className="Artworks__header-back"
					name="chevron-left"
					onClick={() => history.push(`/wallet/collectibles`)}
				/>
				Artworks
			</header>
			<div className="Artworks__main">
				{artworks.map((artwork) => (
					<div
						key={artwork.id}
						className="Artworks__main-card"
						role="button"
						tabIndex={0}
						onClick={() => history.push(`/artworks/${artwork.id}`)}
					>
						<img className="Artworks__main-card-img" src={artwork.image} alt={artwork.name} />
						<h5 className="Artworks__main-card-name">{artwork.name}</h5>
					</div>
				))}
			</div>
		</DashboardLayout>
	);
};
