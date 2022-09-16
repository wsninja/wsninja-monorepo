import WalletConnect from '@walletconnect/client';
import walletConnectBanner from 'assets/images/walletConnect_banner.png';
import { BaseButton } from 'components/button/baseButton';
import { TextButton } from 'components/button/textButton';
import { Col } from 'components/flex/col';
import { Row } from 'components/flex/row';
import { Input } from 'components/form/input/input';
import { Icon } from 'components/icon/icon';
import { Loader } from 'components/loader/loader';
import { ModalPosition } from 'components/modalPosition/modalPosition';
import { QrCodeScanner } from 'components/qrCodeScanner/qrCodeScanner';
import { Text } from 'components/text/text';
import { IWalletConnectRequest } from 'components/walletConnectHandler/types';
import { BaseModal } from 'modals/baseModal/baseModal';
import { ChangeEvent, FC, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useDevice } from 'utils/useDevice';

const StyledBaseModal = styled(BaseModal)<{ paddingTop: boolean }>`
	padding-top: ${({ paddingTop }) => (paddingTop ? '60px' : undefined)};
	align-items: flex-start;
`;

const Container = styled(Col)`
	border-radius: 4px;
	overflow: hidden;
	opacity: 1;
	max-width: 100vw;
	max-height: 100vh;
`;

const WalletConnectBanner = styled.img`
	max-width: 200px;
`;

const UrlInput = styled(Input)`
	width: 100%; // For iOS
`;

const StyledQrCodeScanner = styled(QrCodeScanner)`
	max-width: 100%;
	max-height: 100%;
`;

const DAppIcon = styled.img`
	max-width: 32px;
	max-height: 32px;
`;

const NoPendingRequestsWrapper = styled(Col)`
	border: ${({ theme }) => `1px solid ${theme.color.lightGray}`};
	border-radius: 4px;
`;

interface IWalletConnectModalViewProps {
	x: number;
	y: number;
	isLoading: boolean;
	step: 'uri' | 'scanning' | 'connected';
	onStartScanning: () => void;
	onStopScanning: () => void;
	onSubmitUri: (uri: string) => void;
	name: string;
	logo: string;
	requests: Array<{ connector: WalletConnect; payload: IWalletConnectRequest }>;
	onOpenRequest: (requestId: number) => void;
	onDisconnect: () => void;
	onClose: () => void;
}

export const WalletConnectModalView: FC<IWalletConnectModalViewProps> = ({
	x,
	y,
	isLoading,
	step,
	onStartScanning,
	onStopScanning,
	onSubmitUri,
	name,
	logo,
	requests,
	onOpenRequest,
	onDisconnect,
	onClose,
}) => {
	const { isMobile } = useDevice();
	const [uri, setUri] = useState('');

	const handleChangeUri = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setUri(event.target.value);
	}, []);

	const handleSubmitUri = useCallback(() => {
		onSubmitUri(uri);
	}, [uri, onSubmitUri]);

	return (
		<StyledBaseModal onClose={onClose} paddingTop={step !== 'scanning'}>
			<ModalPosition x={x} y={y}>
				<Container backgroundColor="primaryBackground" horizontalPadding="m" verticalPadding="m">
					{isLoading ? (
						<Col horizontalPadding="8xl" verticalPadding="8xl">
							<Loader />
						</Col>
					) : step === 'uri' ? (
						<Col gap="m" alignItems="center">
							<WalletConnectBanner src={walletConnectBanner} />
							{isMobile && (
								<>
									<TextButton type="primary" text="Scan" onClick={onStartScanning} fullWidth size="s" />
									<Text fontSize="l" fontWeight="semibold">
										or
									</Text>
								</>
							)}
							<UrlInput placeholder="Paste wc: url" value={uri} onChange={handleChangeUri} />
							<TextButton type="primary" text="Ok" onClick={handleSubmitUri} fullWidth size="s" />
						</Col>
					) : step === 'scanning' ? (
						<Col gap="m">
							<StyledQrCodeScanner onSubmit={onSubmitUri} />
							<TextButton type="primary" text="Back" onClick={onStopScanning} fullWidth size="s" />
						</Col>
					) : step === 'connected' ? (
						<Col gap="m">
							<Row justifyContent="space-between">
								<Text fontSize="l" fontWeight="semibold">
									Accounts
								</Text>
								<BaseButton onClick={onClose}>
									<Icon name="close" size={24} />
								</BaseButton>
							</Row>
							<Col gap="s">
								<Text fontSize="m" fontWeight="semibold">
									Session
								</Text>
								<Row gap="s" alignItems="center">
									<DAppIcon src={logo} />
									<Text fontSize="m">{name}</Text>
								</Row>
							</Col>
							<Col gap="s">
								<Text fontSize="m" fontWeight="semibold">
									Requests
								</Text>
								{requests.length === 0 ? (
									<NoPendingRequestsWrapper horizontalPadding="s" verticalPadding="s">
										<Text fontSize="m">No pending requests</Text>
									</NoPendingRequestsWrapper>
								) : (
									requests.map(({ connector, payload }) => {
										let requestName = '';
										switch (payload.method) {
											case 'session_request':
											case 'wc_sessionRequest':
												requestName = 'Session Request';
												break;
											case 'personal_sign':
												requestName = 'Personal Sign Request';
												break;
											case 'eth_sign':
												requestName = 'Sign Request';
												break;
											case 'eth_sendTransaction':
												requestName = 'Send Transaction Request';
												break;
										}
										return (
											<TextButton
												key={payload.id}
												type="secondary"
												text={requestName}
												onClick={() => onOpenRequest(payload.id)}
												size="s"
											/>
										);
									})
								)}
							</Col>
							<TextButton type="primary" text="Disconnect" onClick={onDisconnect} size="s" />
						</Col>
					) : null}
				</Container>
			</ModalPosition>
		</StyledBaseModal>
	);
};
