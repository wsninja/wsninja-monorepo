import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Col } from 'components/flex/col';
import { Row } from 'components/flex/row';
import { Spacing } from 'components/flex/spacing';
import { Button } from 'components/form/button/button';
import { Input } from 'components/form/input/input';
import { Switch } from 'components/form/swtich/switch';
import { messageToast } from 'components/utils';
import React, { FC, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import { updateAskPasswordOnTransaction, updateIsSessionTimeout } from 'store/user/actions';
import { setAskPasswordOnTransaction, setIsSessionTimeout } from 'utils/api/api';
import { decrypt } from 'utils/crypto';
import { useDevice } from 'utils/useDevice';
import './Settings.scss';

export const Settings: FC = () => {
	const { isDesktop } = useDevice();
	const dispatch = useDispatch();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const {
		settings: { askPasswordOnTransaction, isSessionTimeout },
		mnemonic,
		encryptedMnemonic,
		securityToken,
	} = useSelector((state: IRootState) => state.user);
	const [password, setPassword] = useState('');
	const [showEncryptedMnemonic, setShowEncryptedMnemonic] = useState(false);
	const [showMnemonic, setShowMnemonic] = useState(false);

	const downloadKey = useCallback(() => {
		const element = document.createElement('a');
		const file = new Blob([encryptedMnemonic], {
			type: 'text/plain',
		});
		element.href = URL.createObjectURL(file);
		element.download = 'key.txt';
		document.body.appendChild(element);
		element.click();
	}, [encryptedMnemonic]);

	const showKeys = useCallback(() => {
		if (!password) {
			messageToast('Please enter password');
			return;
		}
		const mnemonic2 = decrypt(encryptedMnemonic, password);
		if (mnemonic2 === mnemonic) {
			setShowEncryptedMnemonic(true);
		} else {
			messageToast('Wrong password');
		}
	}, [encryptedMnemonic, password, mnemonic]);

	const hideKeys = useCallback(() => {
		setShowEncryptedMnemonic(false);
		setShowMnemonic(false);
		setPassword('');
	}, []);

	const handleChangeAskPasswordOnTransaction = useCallback(
		async (askPasswordOnTransaction: boolean) => {
			if (securityToken) {
				await setAskPasswordOnTransaction({ value: askPasswordOnTransaction }, securityToken);
				dispatch(updateAskPasswordOnTransaction(askPasswordOnTransaction));
			}
		},
		[securityToken, dispatch]
	);

	const handleChangeIsSessionTimeout = useCallback(
		async (isSessionTimeout: boolean) => {
			if (securityToken) {
				await setIsSessionTimeout({ value: isSessionTimeout }, securityToken);
				dispatch(updateIsSessionTimeout(isSessionTimeout));
			}
		},
		[securityToken, dispatch]
	);

	if (isDesktop) {
		return (
			<DashboardLayout>
				<div className={clsx('DesktopSettings', isDarkTheme && 'DesktopSettings--dark')}>
					<div className="DesktopSettings__card">
						<h2 className="DesktopSettings__heading">Private Keys</h2>
						<p className="DesktopSettings__paragraph">
							Here you can export your Private Key from WSN to another wallet. Never share your key or password.
						</p>
						<div className="DesktopSettings__input-group">
							<Input
								className="DesktopSettings__input-group-password"
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							{showEncryptedMnemonic ? (
								<Button
									className="DesktopSettings__input-group-btn"
									variant="solid"
									color="primary"
									isDarkTheme={isDarkTheme}
									onClick={hideKeys}
								>
									Hide
								</Button>
							) : (
								<Button
									className="DesktopSettings__input-group-btn"
									variant="solid"
									color="primary"
									isDarkTheme={isDarkTheme}
									onClick={showKeys}
								>
									Show
								</Button>
							)}
						</div>
						{showEncryptedMnemonic && (
							<Col>
								<h2 className="DesktopSettings__heading">Key File</h2>
								<p className="DesktopSettings__paragraph">
									WSN Account key file includes all assets from your multi-chain wallet. You can either copy the string
									of symbols manually or click the Download button to get it.
								</p>
								<textarea className="DesktopSettings__textarea" rows={4} value={encryptedMnemonic} readOnly />
								<Row>
									<Button
										className="DesktopSettings__download"
										variant="solid"
										color="primary"
										onClick={() => downloadKey()}
										isDarkTheme={isDarkTheme}
										size="lg"
									>
										Download
									</Button>
									<Button
										className="DesktopSettings__copy"
										variant="ghost"
										color="primary"
										onClick={() => navigator.clipboard.writeText(encryptedMnemonic)}
										isDarkTheme={isDarkTheme}
										size="lg"
									>
										Copy
									</Button>
								</Row>
								<Spacing vertical="3xl" />
								<Row>
									{showMnemonic ? (
										<textarea className="DesktopSettings__textarea" rows={3} value={mnemonic} readOnly />
									) : (
										<Button
											variant="solid"
											color="primary"
											onClick={() => setShowMnemonic(true)}
											isDarkTheme={isDarkTheme}
											size="lg"
										>
											Show decrypted passphrase
										</Button>
									)}
								</Row>
							</Col>
						)}
						<div className="DesktopSettings__switch">
							<p className="DesktopSettings__switch-label">Ask password on transaction</p>
							<Switch
								name="pswd-on-txn"
								checked={askPasswordOnTransaction}
								onChange={() => handleChangeAskPasswordOnTransaction(!askPasswordOnTransaction)}
							/>
						</div>
						<div className="DesktopSettings__switch">
							<p className="DesktopSettings__switch-label">Set session timeout to 15 mins</p>
							<Switch
								name="session-timeout"
								checked={isSessionTimeout}
								onChange={() => handleChangeIsSessionTimeout(!isSessionTimeout)}
							/>
						</div>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout className={clsx('Settings', isDarkTheme && 'Settings--dark')}>
			<h2 className="Settings__heading">Private Keys</h2>
			<p className="Settings__paragraph">
				Here you can export your Private Key from WSN to with another wallet. Never share your key or password.
			</p>
			<div className="Settings__input-group">
				<Input
					className="Settings__input-group-password"
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				{showEncryptedMnemonic ? (
					<Button
						className="Settings__input-group-btn"
						variant="solid"
						color="primary"
						isDarkTheme={isDarkTheme}
						onClick={hideKeys}
					>
						Hide
					</Button>
				) : (
					<Button
						className="Settings__input-group-btn"
						variant="solid"
						color="primary"
						isDarkTheme={isDarkTheme}
						onClick={showKeys}
					>
						Show
					</Button>
				)}
			</div>
			{showEncryptedMnemonic && (
				<Col>
					<h2 className="Settings__heading">Key File</h2>
					<p className="Settings__paragraph">
						WSN Account key file includes all assets from your multi-chain wallet. You can either copy the string of
						symbols manually or click the Download button to get it.
					</p>
					<textarea className="Settings__textarea" rows={6} value={encryptedMnemonic} readOnly />
					<Row>
						<Button
							className="Settings__download"
							variant="solid"
							color="primary"
							onClick={() => downloadKey()}
							isDarkTheme={isDarkTheme}
						>
							Download
						</Button>
						<Button
							className="Settings__copy"
							variant="ghost"
							color="primary"
							onClick={() => navigator.clipboard.writeText(encryptedMnemonic)}
							isDarkTheme={isDarkTheme}
						>
							Copy
						</Button>
					</Row>
					<Spacing vertical="3xl" />
					<Row>
						{showMnemonic ? (
							<textarea className="DesktopSettings__textarea" rows={4} value={mnemonic} readOnly />
						) : (
							<Button variant="solid" color="primary" onClick={() => setShowMnemonic(true)} isDarkTheme={isDarkTheme}>
								Show decrypted passphrase
							</Button>
						)}
					</Row>
				</Col>
			)}
			<div className="Settings__switch">
				<p className="Settings__switch-label">Ask password on transaction</p>
				<Switch
					name="pswd-on-txn"
					checked={askPasswordOnTransaction}
					onChange={() => handleChangeAskPasswordOnTransaction(!askPasswordOnTransaction)}
				/>
			</div>
			<div className="Settings__switch">
				<p className="Settings__switch-label">Set session timeout to 15 mins</p>
				<Switch
					name="session-timeout"
					checked={isSessionTimeout}
					onChange={() => handleChangeIsSessionTimeout(!isSessionTimeout)}
				/>
			</div>
		</DashboardLayout>
	);
};
