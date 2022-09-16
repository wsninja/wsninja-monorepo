import WalletConnect from '@walletconnect/client';
import { IWalletConnectRequest } from 'components/walletConnectHandler/types';
import { WalletConnectModalView } from 'modals/walletConnectModal/walletConnectModalView';
import { Component } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'store/store';

interface IWalletConnectModalProps {
	x: number;
	y: number;
	isLoading: boolean;
	isConnected: boolean;
	name: string;
	logo: string;
	requests: Array<{ connector: WalletConnect; payload: IWalletConnectRequest }>;
	onOpenRequest: (requestId: number) => void;
	onClose: () => void;
	onConnect: (uri: string) => void;
	onDisconnect: () => void;
}

interface IWalletConnectModalState {
	step: 'uri' | 'scanning' | 'connected';
}

class WalletConnectModal extends Component<IWalletConnectModalProps, IWalletConnectModalState> {
	constructor(props: IWalletConnectModalProps) {
		super(props);
		const { isConnected } = props;
		this.state = {
			step: isConnected ? 'connected' : 'uri',
		};
	}

	componentDidUpdate(prevProps: IWalletConnectModalProps) {
		const { isConnected } = this.props;
		if (prevProps.isConnected !== isConnected) {
			this.updateStep();
		}
	}

	updateStep = () => {
		const { isConnected } = this.props;
		if (isConnected) {
			this.setState({ step: 'connected' });
		} else {
			this.setState({ step: 'uri' });
		}
	};

	handleStartScanning = () => {
		this.setState({ step: 'scanning' });
	};

	handleStopScanning = () => {
		this.setState({ step: 'uri' });
	};

	handleSubmitUri = (uri: string) => {
		this.setState({ step: 'uri' }, () => {
			this.props.onConnect(uri);
		});
	};

	render() {
		const { x, y, isLoading, name, logo, requests, onOpenRequest, onDisconnect, onClose } = this.props;
		const { step } = this.state;

		return (
			<WalletConnectModalView
				x={x}
				y={y}
				isLoading={isLoading}
				step={step}
				onStartScanning={this.handleStartScanning}
				onStopScanning={this.handleStopScanning}
				onSubmitUri={this.handleSubmitUri}
				name={name}
				logo={logo}
				requests={requests}
				onOpenRequest={onOpenRequest}
				onDisconnect={onDisconnect}
				onClose={onClose}
			/>
		);
	}
}

const mapStateToProps = ({
	walletConnect: {
		walletConnectModalPosition: { x, y },
	},
}: IRootState) => ({
	x,
	y,
});

const walletConnectModal = connect(mapStateToProps)(WalletConnectModal);

export { walletConnectModal as WalletConnectModal };
