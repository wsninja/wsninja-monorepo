import WalletConnect from '@walletconnect/client';
import walletConnectIcon from 'assets/images/walletConnect.svg';
import { TextButton } from 'components/button/textButton';
import { Col } from 'components/flex/col';
import { Row } from 'components/flex/row';
import { ModalPosition } from 'components/modalPosition/modalPosition';
import { Text } from 'components/text/text';
import { IEthSendTransactionPayload, IWalletConnectRequest } from 'components/walletConnectHandler/types';
import { networks } from 'constants/networks';
import { toBuffer } from 'ethereumjs-util';
import { BaseModal } from 'modals/baseModal/baseModal';
import { FC, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { tokenToString } from 'utils/utils';

const StyledBaseModal = styled(BaseModal)`
	padding-top: 60px;
	align-items: flex-start;
`;

const Container = styled(Col)`
	border-radius: 4px;
	overflow: hidden;
	opacity: 1;
	max-width: 100vw;
	max-height: 70vh;
	overflow-y: scroll;
`;

const Header = styled(Col)`
	border: ${({ theme }) => `1px solid ${theme.color.lightGray}`};
	border-radius: 4px;
`;

const WalletConnectIcon = styled.img`
	max-width: 48px;
	max-height: 48px;
`;

const DAppIcon = styled.img`
	max-width: 32px;
	max-height: 32px;
`;

const ChainWrapper = styled(Row)`
	border: ${({ theme }) => `1px solid ${theme.color.lightGray}`};
	border-radius: 4px;
`;

const ChainLogo = styled.img`
	max-width: 24px;
	max-height: 24px;
`;

const TransactionValue = styled(Text)`
	word-break: break-all;
`;

interface IWalletConnectRequestModalViewProps {
	x: number;
	y: number;
	connector: WalletConnect;
	payload: IWalletConnectRequest;
	onApprove: (requestId: number) => void;
	onReject: (requestId: number) => void;
	onClose: (requestId: number) => void;
}

export const WalletConnectRequestModalView: FC<IWalletConnectRequestModalViewProps> = ({
	x,
	y,
	connector,
	payload,
	onApprove,
	onReject,
	onClose,
}) => {
	const chainId = useMemo(() => {
		if (payload.method === 'session_request' || payload.method === 'wc_sessionRequest') {
			return payload.params[0].chainId;
		}
		return connector.chainId;
	}, [connector, payload]);

	const chainSymbol = useMemo(() => {
		const network = networks.find((network) => network.chainId === BigInt(connector.chainId));
		if (network) {
			return network.symbol;
		}
		return 'UNKNOWN';
	}, [connector]);

	const handleApprove = useCallback(() => onApprove(payload.id), [payload.id, onApprove]);

	const handleReject = useCallback(() => onReject(payload.id), [payload.id, onReject]);

	const handleClose = useCallback(() => onClose(payload.id), [payload.id, onClose]);

	const chainName = useMemo(() => {
		const network = networks.find((network) => network.chainId === BigInt(chainId));
		if (network) {
			return network.label;
		}
		return chainId.toString();
	}, [connector, payload, chainId]);

	const chainLogo = useMemo(() => {
		const network = networks.find((network) => network.chainId === BigInt(chainId));
		if (network) {
			return network.logo;
		}
		return '';
	}, [connector, chainId]);

	const renderedPayload = useMemo(() => {
		switch (payload.method) {
			case 'session_request': {
				const {
					peerMeta: { description, icons, name, url },
				} = payload.params[0];
				return (
					<Col gap="m">
						<Text fontSize="l" fontWeight="semibold">
							Session Request
						</Text>
						<Col gap="s">
							<Row alignItems="center" gap="s">
								{icons.length > 0 && <DAppIcon src={icons[0]} />}
								<Text fontSize="m">{name}</Text>
							</Row>
							<Text fontSize="m"> {url}</Text>
							<Text fontSize="m">{description}</Text>
						</Col>
					</Col>
				);
			}
			case 'eth_sendTransaction': {
				const { preparedTransaction, from } = payload;
				if (!preparedTransaction || !from) {
					return handleReject();
				}
				const { gasLimit, gasPrice } = preparedTransaction;
				if (
					(typeof gasLimit !== 'number' && typeof gasLimit !== 'string') ||
					(typeof gasPrice !== 'number' && typeof gasPrice !== 'string')
				) {
					return handleReject();
				}
				const keys = Object.keys(preparedTransaction) as Array<keyof IEthSendTransactionPayload['preparedTransaction']>;
				return (
					<Col gap="m">
						<Text fontSize="l" fontWeight="semibold">
							Send Transaction Request
						</Text>
						<Row gap="s" justifyContent="space-between">
							<Text fontSize="m">Max gas usage:</Text>
							<Text fontSize="m">
								{tokenToString(BigInt(gasLimit) * BigInt(gasPrice), 18n)} {chainSymbol}
							</Text>
						</Row>
						{preparedTransaction.value && typeof preparedTransaction.value === 'string' && (
							<Row gap="s" justifyContent="space-between">
								<Text fontSize="m">Value:</Text>
								<Text fontSize="m">
									{tokenToString(BigInt(preparedTransaction.value), 18n)} {chainSymbol}
								</Text>
							</Row>
						)}
						<Col gap="s">
							<Text fontSize="m" fontWeight="semibold">
								Data
							</Text>
							<Row gap="s" justifyContent="space-between">
								<Text fontSize="m">from:</Text>
								<TransactionValue fontSize="m">{from}</TransactionValue>
							</Row>
							{keys
								.filter((key) => preparedTransaction[key] !== undefined)
								.map((key) => {
									const value = preparedTransaction[key];
									return (
										<Row key={key} gap="s" justifyContent="space-between">
											<Text fontSize="m">{key}:</Text>
											<TransactionValue fontSize="m">{value}</TransactionValue>
										</Row>
									);
								})}
						</Col>
					</Col>
				);
			}
			case 'personal_sign': {
				const message = payload.params[0];
				return (
					<Col gap="m">
						<Text fontSize="l" fontWeight="semibold">
							Personal Sign Request
						</Text>
						<Col>
							<Text fontSize="m" fontWeight="semibold">
								Decoded
							</Text>
							<TransactionValue fontSize="m">{toBuffer(message).toString('utf8')}</TransactionValue>
						</Col>
						<Col>
							<Text fontSize="m" fontWeight="semibold">
								Data
							</Text>
							<TransactionValue fontSize="m">{message}</TransactionValue>
						</Col>
					</Col>
				);
			}
			case 'eth_sign': {
				const message = payload.params[1];
				return (
					<Col gap="m">
						<Text fontSize="l" fontWeight="semibold">
							Sign Request
						</Text>
						<Col>
							<Text fontSize="m" fontWeight="semibold">
								Decoded
							</Text>
							<TransactionValue fontSize="m">{toBuffer(message).toString('utf8')}</TransactionValue>
						</Col>
						<Col>
							<Text fontSize="m" fontWeight="semibold">
								Data
							</Text>
							<TransactionValue fontSize="m">{message}</TransactionValue>
						</Col>
					</Col>
				);
			}
		}
	}, [payload, chainSymbol, handleReject]);

	return (
		<StyledBaseModal onClose={handleClose}>
			<ModalPosition x={x} y={y}>
				<Container gap="m" backgroundColor="primaryBackground" horizontalPadding="m" verticalPadding="m">
					<Header gap="xs" alignItems="center" horizontalPadding="s" verticalPadding="s">
						<WalletConnectIcon src={walletConnectIcon} />
						<Row gap="s" alignItems="center">
							<DAppIcon src={connector.peerMeta?.icons[0]} />
							<Text fontSize="m" fontWeight="semibold">
								{connector.peerMeta?.name}
							</Text>{' '}
						</Row>
						<Text fontSize="xs">{connector.peerMeta?.url}</Text>
					</Header>
					<Col gap="s">
						<Text fontSize="l" fontWeight="semibold">
							Chain
						</Text>
						<ChainWrapper gap="s" horizontalPadding="s" verticalPadding="s">
							{chainLogo && <ChainLogo src={chainLogo} />}
							<Text fontSize="m" fontWeight="semibold">
								{chainName}
							</Text>
						</ChainWrapper>
					</Col>
					<>{renderedPayload}</>
					<Row fullWidth gap="m">
						<TextButton type="primary" text="Approve" onClick={handleApprove} fullWidth size="s" />
						<TextButton type="secondary" text="Reject" onClick={handleReject} fullWidth size="s" />
					</Row>
				</Container>
			</ModalPosition>
		</StyledBaseModal>
	);
};
