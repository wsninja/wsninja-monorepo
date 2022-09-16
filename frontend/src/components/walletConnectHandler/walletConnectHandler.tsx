import { personalSign } from '@metamask/eth-sig-util';
import WalletConnect from '@walletconnect/client';
import {
	IEthSendRawTransaction,
	IEthSendTransactionPayload,
	IEthSignPayload,
	IEthSignTransaction,
	IEthSignTypedDataPayload,
	IPersonalSignPayload,
	ISessionRequestPayload,
	IWalletConnectRequest,
	IWalletConnectRequestType,
	IWcSessionRequestPayload,
} from 'components/walletConnectHandler/types';
import { addHexPrefix, toBuffer } from 'ethereumjs-util';
import { WalletConnectModal } from 'modals/walletConnectModal/walletConnectModal';
import { WalletConnectRequestModal } from 'modals/walletConnectRequestModal/walletConnectRequestModal';
import { Component } from 'react';
import { connect } from 'react-redux';
import { IDispatch, IRootState } from 'store/store';
import { updateShowWalletConnectModal } from 'store/walletConnect/actions';
import { getEthereumKeys } from 'utils/crypto';
import { prepareBaseTransaction, sendPreparedTransaction } from 'utils/ethereum';
import { errorToString, getChain, sleep } from 'utils/utils';

interface IWalletConnectHandlerProps {
	isAuthenticated: boolean;
	mnemonic: string;
	securityToken: string;
	showWalletConnectModal: boolean;
	updateShowWalletConnectModal: (showWalletConnectModal: boolean) => void;
}

interface IWalletConnectHandlerState {
	isLoading: boolean;
	showRequestModal: boolean;
	connector: WalletConnect | undefined;
	requestsUpdated: number;
}

class WalletConnectHandler extends Component<IWalletConnectHandlerProps, IWalletConnectHandlerState> {
	requests: Array<{ connector: WalletConnect; payload: IWalletConnectRequest; popUp: boolean }> = [];
	requestMutex = false;

	state: IWalletConnectHandlerState = {
		isLoading: false,
		showRequestModal: false,
		connector: undefined,
		requestsUpdated: Math.random(),
	};

	async componentDidMount() {
		try {
			const connector = new WalletConnect({ bridge: 'https://bridge.walletconnect.org' });
			if (connector.accounts.length > 0) {
				connector.killSession();
			}
		} catch (e) {}
	}

	componentDidUpdate = (prevProps: IWalletConnectHandlerProps, prevState: IWalletConnectHandlerState) => {
		const { requestsUpdated } = this.state;
		if (prevState.requestsUpdated !== requestsUpdated) {
			this.pickUpRequest();
		}
	};

	lock = async () => {
		while (this.requestMutex) {
			await sleep(0);
		}
		this.requestMutex = true;
	};

	unlock = () => {
		this.requestMutex = false;
	};

	addRequest = (connector: WalletConnect, payload: IWalletConnectRequest) => {
		if (!this.requests.find((request) => request.payload.id === payload.id)) {
			this.requests = [...this.requests, { connector, payload, popUp: true }];
			this.setState({ requestsUpdated: Math.random() });
		}
	};

	removeRequest = (requestId: number) => {
		this.requests = this.requests.filter((request) => request.payload.id !== requestId);
		this.setState({ requestsUpdated: Math.random(), showRequestModal: false });
		this.unlock();
	};

	closeRequest = (requestId: number) => {
		this.requests = this.requests.map((request) => {
			if (request.payload.id === requestId) {
				return {
					...request,
					popUp: false,
				};
			}
			return request;
		});
		this.setState({ requestsUpdated: Math.random(), showRequestModal: false });
		this.unlock();
	};

	openRequest = (requestId: number) => {
		this.requests = this.requests.map((request) => {
			if (request.payload.id === requestId) {
				return {
					...request,
					popUp: true,
				};
			}
			return request;
		});
		this.setState({ requestsUpdated: Math.random() });
	};

	handleClose = () => {
		this.props.updateShowWalletConnectModal(false);
	};

	handleConnect = async (uri: string) => {
		try {
			this.setState({ isLoading: true });

			const connector = new WalletConnect({
				uri,
				clientMeta: {
					name: 'WallStreetNinja',
					description: 'WallStreetNinja',
					url: '#',
					icons: ['https://walletconnect.com/walletconnect-logo.png'],
				},
			});

			connector.on('connect', (error, payload) => {
				console.log('connect', payload);
				if (error) {
					throw error;
				}
			});

			connector.on('session_request', (error, payload) => {
				console.log('session_request', payload);
				if (error) {
					throw error;
				}
				this.addRequest(connector, payload);
			});

			connector.on('call_request', (error, payload: IWalletConnectRequest) => {
				console.log('call_request', payload);
				if (error) {
					throw error;
				}
				switch (payload.method) {
					case 'personal_sign':
					case 'eth_sign':
					case 'eth_sendTransaction':
						break;
					default:
						return connector.rejectRequest({ id: payload.id, error: { message: 'Method not supported' } });
				}
				this.addRequest(connector, payload);
			});

			connector.on('disconnect', (error, payload) => {
				console.log('disconnect', payload);
				if (error) {
					throw error;
				}
			});

			connector.on('session_update', (error, payload) => {
				console.log('session_update', payload);
				if (error) {
					throw error;
				}
			});

			connector.on('wc_sessionRequest', (error, payload) => {
				console.log('wc_sessionRequest', payload);
				if (error) {
					throw error;
				}
				this.addRequest(connector, payload);
			});

			connector.on('wc_sessionUpdate', (error, payload) => {
				console.log('wc_sessionUpdate', payload);
				if (error) {
					throw error;
				}
			});

			setTimeout(this.handleRejectedUri, 1000 * 10);

			this.setState({ connector });
		} catch (e) {
			this.setState({ isLoading: false });
		}
	};

	handleRejectedUri = () => {
		try {
			const { connector } = this.state;
			if (connector && !connector.connected) {
				this.setState({ connector: undefined, isLoading: false });
			}
		} catch (e) {}
	};

	pickUpRequest = async () => {
		await this.lock();
		const request = this.requests.find((request) => request.popUp);
		if (!request) {
			this.unlock();
			return;
		}
		const { connector, payload } = request;
		if (connector.connected && (payload.method === 'session_request' || payload.method === 'wc_sessionRequest')) {
			this.removeRequest(payload.id);
		} else {
			await this.showRequest(payload.id);
		}
	};

	handleOpenRequest = async (requestId: number) => {
		await this.lock();
		const request = this.requests.find((request) => request.payload.id === requestId);
		if (!request) {
			this.unlock();
			return;
		}
		this.openRequest(requestId);
		await this.showRequest(requestId);
	};

	// Mutex must be set before calling
	showRequest = async (requestId: number) => {
		const request = this.requests.find((request) => request.payload.id === requestId);
		if (!request) {
			this.unlock();
			return;
		}
		const { connector, payload } = request;
		if (connector.connected && (payload.method === 'session_request' || payload.method === 'wc_sessionRequest')) {
			this.removeRequest(payload.id);
		} else {
			if (payload.method === 'eth_sendTransaction') {
				try {
					this.setState({ isLoading: true });
					const { securityToken, mnemonic } = this.props;
					const chain = getChain(connector.chainId);
					const { address } = getEthereumKeys(mnemonic);
					const { from, to, value, data } = payload.params[0];
					const preparedTransaction = await prepareBaseTransaction(chain, { from, to, value, data }, securityToken);
					const requestIndex = this.requests.findIndex((request) => request.payload.id === requestId);
					(this.requests[requestIndex].payload as IEthSendTransactionPayload).preparedTransaction = preparedTransaction;
					(this.requests[requestIndex].payload as IEthSendTransactionPayload).from = address;
				} finally {
					this.setState({ isLoading: false });
				}
			}
			this.setState({ showRequestModal: true });
		}
	};

	handleApproveRequest = (requestId: number) => {
		const request = this.requests.find((request) => request.payload.id === requestId);
		if (request) {
			const { connector, payload } = request;
			try {
				switch (payload.method as IWalletConnectRequestType) {
					case 'session_request':
					case 'wc_sessionRequest':
						this.handleSessionRequest(connector, payload as ISessionRequestPayload | IWcSessionRequestPayload);
						break;
					case 'eth_sendTransaction':
						this.handleEthSendTransactionRequest(connector, payload as IEthSendTransactionPayload);
						break;
					case 'personal_sign':
						this.handlePersonalSignRequest(connector, payload as IPersonalSignPayload);
						break;
					case 'eth_sign':
						this.handleEthSignRequest(connector, payload as IEthSignPayload);
						break;
					case 'eth_signTypedData':
						this.handleEthSignTypedDataRequest(connector, payload as IEthSignTypedDataPayload);
						break;
					case 'eth_signTransaction':
						this.handleEthSignTransaction(connector, payload as IEthSignTransaction);
						break;
					case 'eth_sendRawTransaction':
						this.handleEthSendRawTransaction(connector, payload as IEthSendRawTransaction);
						break;
					default:
						connector.rejectRequest({ id: payload.id, error: { message: 'Method not supported' } });
				}
			} catch (e) {
				connector.rejectRequest({ id: payload.id, error: { message: errorToString(e) } });
			} finally {
				this.removeRequest(requestId);
			}
		}
	};

	handleRejectRequest = (requestId: number) => {
		const request = this.requests.find((request) => request.payload.id === requestId);
		if (request) {
			const { connector, payload } = request;
			try {
				connector.rejectRequest({ id: payload.id, error: { message: 'User rejected request' } });
				if (payload.method === 'session_request' || payload.method === 'wc_sessionRequest') {
					connector.killSession();
					this.requests = [];
					this.setState({ connector: undefined, isLoading: false });
				}
			} finally {
				this.removeRequest(requestId);
			}
		}
	};

	handleCloseRequest = (requestId: number) => {
		this.closeRequest(requestId);
	};

	handleSessionRequest = (connector: WalletConnect, payload: ISessionRequestPayload | IWcSessionRequestPayload) => {
		const { mnemonic } = this.props;
		const { address } = getEthereumKeys(mnemonic);
		if (!connector.connected) {
			try {
				connector.approveSession({
					accounts: [address],
					chainId: payload.params[0].chainId,
				});
			} finally {
				this.setState({ isLoading: false });
			}
		}
	};

	handleEthSendTransactionRequest = async (connector: WalletConnect, payload: IEthSendTransactionPayload) => {
		const { mnemonic, securityToken } = this.props;
		const { preparedTransaction } = payload;
		if (!preparedTransaction) {
			throw new Error('preparedTransaction is undefined');
		}
		const chain = getChain(connector.chainId);
		const { privateKey } = getEthereumKeys(mnemonic);
		const transactionReceipt = await sendPreparedTransaction(chain, preparedTransaction, securityToken, privateKey);
		connector.approveRequest({
			id: payload.id,
			result: transactionReceipt.transactionHash,
		});
	};

	handlePersonalSignRequest = (connector: WalletConnect, payload: IPersonalSignPayload) => {
		const { mnemonic } = this.props;
		const [signMessage] = payload.params;
		const { privateKey } = getEthereumKeys(mnemonic);
		const signature = personalSign({ data: signMessage, privateKey: toBuffer(addHexPrefix(privateKey)) });
		connector.approveRequest({
			id: payload.id,
			result: signature,
		});
	};

	handleEthSignRequest = (connector: WalletConnect, payload: IEthSignPayload) => {
		const { mnemonic } = this.props;
		const [, signMessage] = payload.params;
		const { privateKey } = getEthereumKeys(mnemonic);
		const signature = personalSign({ data: signMessage, privateKey: toBuffer(addHexPrefix(privateKey)) });
		connector.approveRequest({
			id: payload.id,
			result: signature,
		});
	};

	handleEthSignTypedDataRequest = async (connector: WalletConnect, payload: IEthSignTypedDataPayload) => {
		connector.rejectRequest({ id: payload.id, error: { message: 'Method not supported' } });
	};

	handleEthSignTransaction = (connector: WalletConnect, payload: IEthSignTransaction) => {
		connector.rejectRequest({ id: payload.id, error: { message: 'Method not supported' } });
	};

	handleEthSendRawTransaction = (connector: WalletConnect, payload: IEthSendRawTransaction) => {
		connector.rejectRequest({ id: payload.id, error: { message: 'Method not supported' } });
	};

	handleDisconnect = () => {
		const { connector } = this.state;
		if (connector && connector.connected) {
			connector.killSession();
			this.setState({ connector: undefined });
			this.props.updateShowWalletConnectModal(false);
		}
	};

	render() {
		const { showWalletConnectModal } = this.props;
		const { connector, showRequestModal, isLoading } = this.state;

		if (showRequestModal) {
			const request = this.requests.find((request) => request.popUp);
			if (request) {
				const { connector, payload } = request;
				return (
					<WalletConnectRequestModal
						connector={connector}
						payload={payload}
						onApprove={this.handleApproveRequest}
						onReject={this.handleRejectRequest}
						onClose={this.handleCloseRequest}
					/>
				);
			}
		}

		if (showWalletConnectModal) {
			return (
				<WalletConnectModal
					isLoading={isLoading}
					isConnected={connector?.connected ?? false}
					name={connector?.peerMeta?.name ?? ''}
					logo={connector?.peerMeta?.icons[0] ?? ''}
					requests={this.requests}
					onOpenRequest={this.handleOpenRequest}
					onClose={this.handleClose}
					onConnect={this.handleConnect}
					onDisconnect={this.handleDisconnect}
				/>
			);
		}
		return null;
	}
}

const mapStateToProps = ({
	user: { isAuthenticated, mnemonic, securityToken },
	walletConnect: { showWalletConnectModal },
}: IRootState) => ({
	isAuthenticated,
	mnemonic,
	securityToken,
	showWalletConnectModal,
});

const mapDispatchToProps = (dispatch: IDispatch) => ({
	updateShowWalletConnectModal: (showWalletConnectModal: boolean) =>
		dispatch(updateShowWalletConnectModal(showWalletConnectModal)),
});

const walletConnectHandler = connect(mapStateToProps, mapDispatchToProps)(WalletConnectHandler);

export { walletConnectHandler as WalletConnectHandler };
