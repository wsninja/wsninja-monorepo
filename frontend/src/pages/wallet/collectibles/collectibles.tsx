import ArtworksImage from 'assets/images/artworks.png';
import DomainsImage from 'assets/images/domains.png';
import StarImg from 'assets/images/star.svg';
import clsx from 'clsx';
import React, { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { useDevice } from 'utils/useDevice';
import './Collectibles.scss';

interface ICollectiblesProps {
	children?: ReactNode;
}

export const Collectibles: FC<ICollectiblesProps> = ({ children }) => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	// const [collectibles, setCollectibles] = React.useState([])
	// const [isLoading, setIsLoading] = React.useState(true)

	// React.useEffect(() => {
	//    ;(async () => {
	//       try {
	//          setCollectibles([
	//             {
	//                id: 1,
	//                name: 'Artworks',
	//                image: '',
	//             },
	//             {
	//                id: 2,
	//                name: 'Domain',
	//                image: '',
	//             },
	//          ])
	//       } catch (err) {
	//          console.log(err)
	//       } finally {
	//          setIsLoading(false)
	//       }
	//    })()
	// }, [])

	// if (isLoading) return 'Loading...'

	if (isDesktop) {
		return (
			<div className={clsx('DesktopCollectibles', isDarkTheme && 'DesktopCollectibles--dark')}>
				<div className="DesktopCollectibles__list">
					<div
						className="DesktopCollectibles__card"
						role="button"
						tabIndex={0}
						onClick={() => history.push('/artworks')}
					>
						<img className="DesktopCollectibles__card-img" src={ArtworksImage} alt="Artworks" />
						<h3 className="DesktopCollectibles__card-name">Artworks</h3>
					</div>
					<div
						className="DesktopCollectibles__card"
						role="button"
						tabIndex={0}
						onClick={() => history.push('/domains')}
					>
						<img className="DesktopCollectibles__card-img" src={DomainsImage} alt="Domains" />
						<h3 className="DesktopCollectibles__card-name">Domains</h3>
					</div>
				</div>
				<div className="DesktopCollectibles__panel">
					{children ?? (
						<div className="DesktopCollectibles__panel-filler">
							<img className="DesktopCollectibles__panel-filler-img" src={StarImg} alt="Open Sea" />
							<h3 className="DesktopCollectibles__panel-filler-text">Receive Collectibles here</h3>
							<h3 className="DesktopCollectibles__panel-filler-text">Buy at Open Sea</h3>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className={clsx('Collectibles', isDarkTheme && 'Collectibles--dark')}>
			<div className="Collectibles__card" role="button" tabIndex={0} onClick={() => history.push('/artworks')}>
				<img className="Collectibles__card-img" src={ArtworksImage} alt="Artworks" />
				<h3 className="Collectibles__card-name">Artworks</h3>
			</div>
			<div className="Collectibles__card" role="button" tabIndex={0} onClick={() => history.push('/domains')}>
				<img className="Collectibles__card-img" src={DomainsImage} alt="Domains" />
				<h3 className="Collectibles__card-name">Domains</h3>
			</div>
		</div>
	);
};
