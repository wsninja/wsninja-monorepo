import BrandLogoGifImage from 'assets/images/brand-logo.gif';
import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { Input } from 'components/form/input/input';
import { HomeLayout } from 'components/homeLayout/homeLayout';
import { errorToast, messageToast } from 'components/utils';
import React, { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { login } from 'store/user/actions';
import { addUser, addWalletTokensToCustomTokens, getUserSettings } from 'utils/api/api';
import { decrypt, getEthereumKeys } from 'utils/crypto';
import { useDevice } from 'utils/useDevice';
import { errorToString } from 'utils/utils';
import './Login.scss';

export const Login: FC = () => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const dispatch = useDispatch();
	const { isAuthenticated } = useSelector((state: IRootState) => state.user);
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const [password, setPassword] = useState('');
	const { encryptedMnemonic } = useSelector((state: IRootState) => state.user);

	useEffect(() => {
		if (isAuthenticated) {
			history.push('/home');
		} else if (!encryptedMnemonic) {
			history.push('/');
		}
	}, [isAuthenticated, history, encryptedMnemonic]);

	const handleSubmit = useCallback(async () => {
		try {
			const mnemonic = decrypt(encryptedMnemonic, password);
			if (!mnemonic) {
				messageToast('Wrong password');
			} else {
				const { privateKey } = getEthereumKeys(mnemonic);
				const { securityToken, newUser } = await addUser(privateKey);
				if (newUser) {
					await addWalletTokensToCustomTokens(securityToken);
				}
				const { askPasswordOnTransaction, isSessionTimeout } = await getUserSettings(securityToken);
				dispatch(
					login(mnemonic, encryptedMnemonic, securityToken, {
						askPasswordOnTransaction,
						isSessionTimeout,
					})
				);
				history.push('/home');
			}
		} catch (e) {
			errorToast(errorToString(e));
		}
	}, [dispatch, encryptedMnemonic, history, password]);

	const handleEnter = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			await handleSubmit();
		},
		[handleSubmit]
	);

	if (isDesktop) {
		return (
			<HomeLayout>
				<div className={clsx('DesktopLogin', isDarkTheme && 'DesktopLogin--dark')}>
					<div className="DesktopLogin__card">
						<h2 className="DesktopLogin__heading">Welcome Back!</h2>
						<div className="DesktopLogin__gif-container">
							<img alt="WallStreetNinja" className="DesktopLogin__gif" src={BrandLogoGifImage} />
						</div>
						<form className="DesktopLogin__form" onSubmit={handleEnter}>
							<Input
								className="DesktopLogin__form-input"
								placeholder="Password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<Button
								className="DesktopLogin__form-cta"
								variant="solid"
								color="primary"
								onClick={() => handleSubmit()}
								size="lg"
								isDarkTheme={isDarkTheme}
							>
								Log In
							</Button>
						</form>
					</div>
				</div>
			</HomeLayout>
		);
	}

	return (
		<HomeLayout>
			<main className={clsx('Login', isDarkTheme && 'Login--dark')}>
				<h2 className="Login__heading">Welcome Back!</h2>
				<div className="Login__gif-container">
					<img alt="WallStreetNinja" className="Login__gif" src={BrandLogoGifImage} />
				</div>
				<form className="Login__form">
					<Input
						className="Login__form-input"
						placeholder="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Button
						className="Login__form-cta"
						variant="solid"
						color="primary"
						onClick={() => handleSubmit()}
						isDarkTheme={isDarkTheme}
					>
						Log In
					</Button>
				</form>
			</main>
		</HomeLayout>
	);
};
