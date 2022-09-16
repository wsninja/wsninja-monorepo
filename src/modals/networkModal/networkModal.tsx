import { NetworkModalView } from 'modals/networkModal/networkModalView';
import { Component } from 'react';
import { connect } from 'react-redux';
import { updateChain } from 'store/network/actions';
import { IDispatch, IRootState } from 'store/store';
import { IChain } from 'types';

interface INetworkModalProps {
	fadeOut: boolean;
	networkModalPosition: { x: number; y: number };
	onClose: () => void;
	updateChain: (chain: IChain) => void;
}

class NetworkModal extends Component<INetworkModalProps> {
	handleChange = (chain: IChain) => {
		this.props.updateChain(chain);
		this.props.onClose();
	};

	render() {
		const {
			fadeOut,
			networkModalPosition: { x, y },
			onClose,
		} = this.props;

		return <NetworkModalView fadeOut={fadeOut} x={x} y={y} onClose={onClose} onChange={this.handleChange} />;
	}
}

const mapStateToProps = ({ network: { networkModalPosition } }: IRootState) => ({ networkModalPosition });

const mapDispatchToProps = (dispatch: IDispatch) => ({
	updateChain: (chain: IChain) => dispatch(updateChain(chain)),
});

const networkModal = connect(mapStateToProps, mapDispatchToProps)(NetworkModal);

export { networkModal as NetworkModal };
