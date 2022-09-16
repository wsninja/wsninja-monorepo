import { BaseButton } from 'components/button/baseButton';
import { networks } from 'constants/networks';
import { uniqueId } from 'lodash';
import { NetworkModal } from 'modals/networkModal/networkModal';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateChain, updateNetworkModalPosition } from 'store/network/actions';
import { IDispatch, IRootState } from 'store/store';
import styled from 'styled-components';
import { IChain } from 'types';

const StyledButton = styled(BaseButton)`
	width: 32px;
	justify-content: center;
`;

const Icon = styled.img`
	max-width: 32px;
	max-height: 32px;
	filter: ${({ theme }) => (theme.isDark ? 'opacity(100%) grayscale(100%) brightness(0%) invert()' : undefined)};
`;

interface INetworkButtonProps {
	className?: string;
	chain: IChain;
	updateChain: (chain: IChain) => void;
	updateNetworkModalPosition: (networkModalPosition: { x: number; y: number }) => void;
}

interface INetworkButtonState {
	showNetworkModal: boolean;
	fadeOutNetworkModal: boolean;
}

class NetworkButton extends Component<INetworkButtonProps, INetworkButtonState> {
	readonly buttonElementId = uniqueId('NetworkButton-');
	resizeObserver: ResizeObserver | undefined;

	state: INetworkButtonState = {
		showNetworkModal: false,
		fadeOutNetworkModal: false,
	};

	componentDidMount() {
		this.resizeObserver = new ResizeObserver(() => {
			this.updateNetworkModalPosition();
		});
		const element = document.getElementById(this.buttonElementId);
		if (element) {
			this.resizeObserver.observe(element);
		}
		window.addEventListener('resize', this.handleWindowResize);
		this.updateNetworkModalPosition();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleWindowResize);
		this.resizeObserver?.disconnect();
	}

	updateNetworkModalPosition = () => {
		const element = document.getElementById(this.buttonElementId);
		if (element) {
			const { x, y, height, width } = element.getBoundingClientRect();
			this.props.updateNetworkModalPosition({ x: x + width, y: y + height + 30 });
		}
	};

	handleWindowResize = (event: UIEvent) => {
		this.updateNetworkModalPosition();
	};

	handleOpen = () => {
		this.setState({ showNetworkModal: true });
	};

	handleClose = () => {
		this.setState({ fadeOutNetworkModal: true }, () => {
			setTimeout(() => {
				this.setState({ showNetworkModal: false, fadeOutNetworkModal: false });
			}, 250);
		});
	};

	render() {
		const { className, chain } = this.props;
		const { showNetworkModal, fadeOutNetworkModal } = this.state;
		const network = networks.find((network) => network.chain === chain);
		if (!network) {
			return null;
		}

		return (
			<>
				<StyledButton id={this.buttonElementId} className={className} onClick={this.handleOpen}>
					<Icon src={network.logo} />
				</StyledButton>
				{showNetworkModal && <NetworkModal fadeOut={fadeOutNetworkModal} onClose={this.handleClose} />}
			</>
		);
	}
}

const mapStateToProps = ({ network: { chain } }: IRootState) => ({ chain });

const mapDispatchToProps = (dispatch: IDispatch) => ({
	updateChain: (chain: IChain) => dispatch(updateChain(chain)),
	updateNetworkModalPosition: (networkModalPosition: { x: number; y: number }) =>
		dispatch(updateNetworkModalPosition(networkModalPosition)),
});

const networkButton = connect(mapStateToProps, mapDispatchToProps)(NetworkButton);

export { networkButton as NetworkButton };
