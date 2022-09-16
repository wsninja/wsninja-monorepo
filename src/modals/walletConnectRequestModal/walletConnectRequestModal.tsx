import WalletConnect from '@walletconnect/client';
import { IWalletConnectRequest } from 'components/walletConnectHandler/types';
import { WalletConnectRequestModalView } from 'modals/walletConnectRequestModal/walletConnectRequestModalView';
import { Component } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'store/store';

interface IWalletConnectRequestModalProps {
	x: number;
	y: number;
	connector: WalletConnect;
	payload: IWalletConnectRequest;
	onApprove: (requestId: number) => void;
	onReject: (requestId: number) => void;
	onClose: (requestId: number) => void;
}

class WalletConnectRequestModal extends Component<IWalletConnectRequestModalProps> {
	render() {
		const { x, y, connector, payload, onApprove, onReject, onClose } = this.props;

		return (
			<WalletConnectRequestModalView
				x={x}
				y={y}
				connector={connector}
				payload={payload}
				onApprove={onApprove}
				onReject={onReject}
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

const walletConnectRequestModal = connect(mapStateToProps)(WalletConnectRequestModal);

export { walletConnectRequestModal as WalletConnectRequestModal };
