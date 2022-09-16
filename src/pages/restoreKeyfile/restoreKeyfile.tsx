import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { HomeLayout } from 'components/homeLayout/homeLayout';
import { errorToast, messageToast } from 'components/utils';
import { uniqueId } from 'lodash';
import { EnterKey } from 'pages/restoreKeyfile/enterKey/enterKey';
import React, { ChangeEvent, FC, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { login } from 'store/user/actions';
import styled from 'styled-components';
import { addUser, addWalletTokensToCustomTokens, getUserSettings } from 'utils/api/api';
import { decrypt, getEthereumKeys } from 'utils/crypto';
import { useDevice } from 'utils/useDevice';
import { arrayBufferToString, errorToString } from 'utils/utils';
import './RestoreKeyfile.scss';

const FileInput = styled.input`
	display: none;
`;

export const RestoreKeyfile: FC = () => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const dispatch = useDispatch();
	const { isAuthenticated, password } = useSelector((state: IRootState) => state.user);
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const fileInputElementId = useMemo(() => uniqueId('file-input-'), []);

	useEffect(() => {
		if (isAuthenticated) {
			history.push('/home');
		} else if (!password) {
			history.push('/restore-password-keyfile');
		}
	}, [isAuthenticated, history, password]);

	const [key, setKey] = useState('');

	const pasteFromClipboard = async () => {
		try {
			let clipboardData = await navigator.clipboard.readText();
			setKey(clipboardData);
		} catch (e) {
			errorToast(`Failed to copy: ${errorToString(e)}`);
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		try {
			e.preventDefault();
			if (!key) {
				messageToast('Please enter key');
			} else {
				const mnemonic = decrypt(key, password);
				if (!mnemonic) {
					messageToast('Cannot decrypt key with given password');
				} else {
					const { privateKey } = getEthereumKeys(mnemonic);
					const { securityToken, newUser } = await addUser(privateKey);
					if (newUser) {
						await addWalletTokensToCustomTokens(securityToken);
					}
					const { askPasswordOnTransaction, isSessionTimeout } = await getUserSettings(securityToken);
					dispatch(
						login(mnemonic, key, securityToken, {
							askPasswordOnTransaction,
							isSessionTimeout,
						})
					);
					history.push('/home');
				}
			}
		} catch (e) {
			errorToast(errorToString(e));
		}
	};

	const handleClickUploadFile = useCallback(() => {
		const fileInputElement = document.getElementById(fileInputElementId);
		if (fileInputElement) {
			fileInputElement.click();
		}
	}, [fileInputElementId]);

	const handleUploadFile = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (event.target.files && event.target.files.length > 0) {
				const reader = new FileReader();
				reader.addEventListener('load', (event) => {
					if (event.target?.result) {
						const newKey =
							event.target.result instanceof ArrayBuffer
								? arrayBufferToString(event.target.result)
								: event.target.result;
						const matches = newKey.match(/(?:data:.*;base64,)(.*)/);
						if (matches) {
							setKey(Buffer.from(matches[1], 'base64').toString('utf8'));
						} else {
							setKey(newKey);
						}
					}
				});
				reader.readAsDataURL(event.target.files[0]);
			}
		},
		[setKey]
	);

	if (isDesktop) {
		return (
			<HomeLayout>
				<div className={clsx('DesktopRestoreKeyfile', isDarkTheme && 'DesktopRestoreKeyfile--dark')}>
					<div className="DesktopRestoreKeyfile__card">
						<h2 className="DesktopRestoreKeyfile__heading">Restore Account</h2>
						<p className="DesktopRestoreKeyfile__paragraph">
							You will be able to restore your wallet by using a key file if you are a WSN user.
						</p>
						<div className="DesktopRestoreKeyfile__switch-container">
							<FileInput type="file" id={fileInputElementId} onChange={handleUploadFile} />
							<Button variant="ghost" color="primary" onClick={handleClickUploadFile} isDarkTheme={isDarkTheme}>
								Upload File
							</Button>
						</div>
						<form className="DesktopRestoreKeyfile__form" onSubmit={handleSubmit}>
							<div className="DesktopRestoreKeyfile__mode-container">
								<EnterKey
									value={key}
									onChange={(e) => setKey(e.target.value)}
									isDarkTheme={isDarkTheme}
									onPaste={pasteFromClipboard}
								/>
							</div>
							<Button
								className="DesktopRestoreKeyfile__form-cta"
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
			<main className={clsx('RestoreKeyfile', isDarkTheme && 'RestoreKeyfile--dark')}>
				<h2 className="RestoreKeyfile__heading">Restore Account</h2>
				<p className="RestoreKeyfile__paragraph">
					You will be able to restore your wallet by using a key file and password if you are a WSN user.
				</p>
				<div className="RestoreKeyfile__switch-container">
					<FileInput type="file" id={fileInputElementId} onChange={handleUploadFile} />
					<Button variant="outline" color="primary" onClick={handleClickUploadFile} isDarkTheme={isDarkTheme}>
						Upload File
					</Button>
				</div>
				<form className="RestoreKeyfile__form" onSubmit={handleSubmit}>
					<div className="RestoreKeyfile__mode-container">
						<EnterKey
							value={key}
							onChange={(e) => setKey(e.target.value)}
							onPaste={pasteFromClipboard}
							isDarkTheme={isDarkTheme}
						/>
					</div>
					<Button
						className="RestoreKeyfile__form-cta"
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
