import clsx from 'clsx';
import { Button } from 'components/form/button/button';
import { HomeLayout } from 'components/homeLayout/homeLayout';
import React, { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import { useDevice } from 'utils/useDevice';
import './DownloadKey.scss';

export const DownloadKey: FC = () => {
	const history = useHistory();
	const { isDesktop } = useDevice();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { encryptedMnemonic } = useSelector((state: IRootState) => state.user);

	const downloadKey = useCallback(() => {
		const element = document.createElement('a');
		const file = new Blob([encryptedMnemonic], {
			type: 'text/plain',
		});
		element.href = URL.createObjectURL(file);
		element.download = 'key.txt';
		document.body.appendChild(element);
		element.click();
		history.push('/home');
	}, [encryptedMnemonic, history]);

	if (isDesktop) {
		return (
			<HomeLayout>
				<div className={clsx('DesktopDownloadKey', isDarkTheme && 'DesktopDownloadKey--dark')}>
					<div className="DesktopDownloadKey__card">
						<h2 className="DesktopDownloadKey__heading">Download your key file</h2>
						<p className="DesktopDownloadKey__paragraph">
							Please download your key file and store it safely in addition to your password.
						</p>
						<ul className="DesktopDownloadKey__list">
							<li className="DesktopDownloadKey__list-item">
								Access to your account is only possible using both the password and key file.
							</li>
							<li className="DesktopDownloadKey__list-item">
								For security reasons WSN does not store your key file or is able to restore it. Only you have access to
								your account.
							</li>
							<li className="DesktopDownloadKey__list-item">Never share your key or password.</li>
						</ul>
						<Button
							className="DesktopDownloadKey__cta"
							variant="solid"
							color="primary"
							onClick={() => downloadKey()}
							size="lg"
						>
							Download Key
						</Button>
					</div>
				</div>
			</HomeLayout>
		);
	}

	return (
		<HomeLayout>
			<main className={clsx('DownloadKey', isDarkTheme && 'DownloadKey--dark')}>
				<h2 className="DownloadKey__heading">Download your key file</h2>
				<p className="DownloadKey__paragraph">
					Please download your key file and store it safely in addition to your password.
				</p>
				<ul className="DownloadKey__list">
					<li className="DownloadKey__list-item">
						Access to your account is only possible using both the password and key file.
					</li>
					<li className="DownloadKey__list-item">
						For security reasons WSN does not store your key file or is able to restore it. Only you have access to your
						account.
					</li>
					<li className="DownloadKey__list-item">Never share your key or password.</li>
				</ul>
				<Button
					className="DownloadKey__cta"
					variant="solid"
					color="primary"
					onClick={() => downloadKey()}
					isDarkTheme={isDarkTheme}
				>
					Download Key
				</Button>
			</main>
		</HomeLayout>
	);
};
