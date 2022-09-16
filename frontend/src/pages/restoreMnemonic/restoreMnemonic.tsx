import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { HomeLayout } from 'components/homeLayout/homeLayout';
import { errorToast, messageToast } from 'components/utils';
import { EnterKey } from 'pages/restoreMnemonic/enterKey/enterKey';
import React, { FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { login } from 'store/user/actions';
import { addUser, addWalletTokensToCustomTokens, getUserSettings } from 'utils/api/api';
import { encrypt, getEthereumKeys } from 'utils/crypto';
import { useDevice } from 'utils/useDevice';
import { errorToString } from 'utils/utils';
import './RestoreMnemonic.scss';

export const RestoreMnemonic: FC = () => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const dispatch = useDispatch();
	const { isAuthenticated, password } = useSelector((state: IRootState) => state.user);
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	useEffect(() => {
		if (isAuthenticated) {
			history.push('/home');
		} else if (!password) {
			history.push('/restore-password-passphrase');
		}
	}, [isAuthenticated, history, password]);

	const [key, setKey] = useState('');

	const pasteFromClipboard = async () => {
		try {
			const clipboardData = await navigator.clipboard.readText();
			setKey(clipboardData);
		} catch (err) {
			console.log('Failed to copy: ', errorToString(err));
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		try {
			e.preventDefault();
			const mnemonic = key.trim();
			if (!validateMnemonic(mnemonic, wordlist)) {
				messageToast('Invalid passphrase');
			} else {
				const encryptedMnemonic = encrypt(mnemonic, password);
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
	};

	if (isDesktop) {
		return (
			<HomeLayout>
				<div className={clsx('DesktopRestoreMnemonic', isDarkTheme && 'DesktopRestoreMnemonic--dark')}>
					<div className="DesktopRestoreMnemonic__card">
						<h2 className="DesktopRestoreMnemonic__heading">Restore Account</h2>
						<p className="DesktopRestoreMnemonic__paragraph">
							You will be able to restore your wallet by using a passphrase if you are a WSN user.
						</p>
						<form className="DesktopRestoreMnemonic__form" onSubmit={handleSubmit}>
							<div className="DesktopRestoreMnemonic__mode-container">
								<EnterKey
									value={key}
									onChange={(e) => setKey(e.target.value)}
									isDarkTheme={isDarkTheme}
									onPaste={pasteFromClipboard}
								/>
							</div>
							<Button
								className="DesktopRestoreMnemonic__form-cta"
								variant="solid"
								color="primary"
								type="submit"
								isDarkTheme={isDarkTheme}
								size="lg"
							>
								Restore
							</Button>
						</form>
					</div>
				</div>
			</HomeLayout>
		);
	}

	return (
		<HomeLayout>
			<main className={clsx('RestoreMnemonic', isDarkTheme && 'RestoreMnemonic--dark')}>
				<h2 className="RestoreMnemonic__heading">Restore Account</h2>
				<p className="RestoreMnemonic__paragraph">
					You will be able to restore your wallet by using a passphrase if you are a WSN user.
				</p>
				<form className="RestoreMnemonic__form" onSubmit={handleSubmit}>
					<div className="RestoreMnemonic__mode-container">
						<EnterKey
							value={key}
							onChange={(e) => setKey(e.target.value)}
							onPaste={pasteFromClipboard}
							isDarkTheme={isDarkTheme}
						/>
					</div>
					<Button
						className="RestoreMnemonic__form-cta"
						variant="solid"
						color="primary"
						type="submit"
						isDarkTheme={isDarkTheme}
					>
						Restore
					</Button>
				</form>
			</main>
		</HomeLayout>
	);
};
