import LogoWithTagline from 'assets/images/logo-with-tagline.png';
import clsx from 'clsx';
import { Icon } from 'components/icon/icon';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { logout } from 'store/user/actions';
import styled from 'styled-components';
import './Sidebar.scss';

const Background = styled.div<{ isOpen: boolean }>`
	display: ${({ isOpen }) => (isOpen ? undefined : 'none')};
	position: fixed;
	top: 48px;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: transparent;
`;

interface ISidebarPorps {
	isOpen: boolean;
	onClose: () => void;
}

export const Sidebar: FC<ISidebarPorps> = ({ isOpen, onClose }) => {
	const history = useHistory();
	const dispatch = useDispatch();

	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const handleLogout = () => {
		dispatch(logout());
		history.push('/');
	};

	return (
		<Background isOpen={isOpen} onClick={onClose}>
			<aside className={clsx('Sidebar', isOpen && 'Sidebar--open', isDarkTheme && 'Sidebar--dark')}>
				<ul className="Sidebar__list">
					<li className="Sidebar__list-item">
						<Link className="Sidebar__list-item-link" to="/home">
							<Icon name="home" color={isDarkTheme ? '#fff' : '#1d1d1d'} />
							Home
						</Link>
					</li>
					<li className="Sidebar__list-item">
						<Link className="Sidebar__list-item-link" to="/apps">
							<Icon name="apps" color={isDarkTheme ? '#fff' : '#1d1d1d'} />
							Dapps
						</Link>
					</li>
					<li className="Sidebar__list-item">
						<Link className="Sidebar__list-item-link" to="/wallet">
							<Icon name="wallet" color={isDarkTheme ? '#fff' : '#1d1d1d'} />
							Wallet
						</Link>
					</li>
					<li className="Sidebar__list-item">
						<Link className="Sidebar__list-item-link" to="/watchlist">
							<Icon name="eye" color={isDarkTheme ? '#fff' : '#1d1d1d'} size={32} /> Watchlist
						</Link>
					</li>
					<li className="Sidebar__list-item">
						<Link className="Sidebar__list-item-link" to="/exchange">
							<Icon name="exchange" color={isDarkTheme ? '#fff' : '#1d1d1d'} /> Exchange
						</Link>
					</li>
					<li className="Sidebar__list-item">
						<Link className="Sidebar__list-item-link" to="/settings">
							<Icon name="cog" color={isDarkTheme ? '#fff' : '#1d1d1d'} /> Settings
						</Link>
					</li>
					<li className="Sidebar__list-item" onClick={handleLogout}>
						<Link className="Sidebar__list-item-link" to="#">
							<Icon name="sign-out" color={isDarkTheme ? '#fff' : '#1d1d1d'} size={32} /> Logout
						</Link>
					</li>
				</ul>
				<img src={LogoWithTagline} alt="WSN" />
			</aside>
		</Background>
	);
};
