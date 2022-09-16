import walletConnectIcon from 'assets/images/walletConnect.svg';
import { BaseButton } from 'components/button/baseButton';
import { uniqueId } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import { IDispatch } from 'store/store';
import { updateShowWalletConnectModal, updateWalletConnectModalPosition } from 'store/walletConnect/actions';
import styled from 'styled-components';

const StyledButton = styled(BaseButton)`
	width: 32px;
	justify-content: center;
`;

const Icon = styled.img`
	max-width: 32px;
	max-height: 32px;
	filter: ${({ theme }) => (theme.isDark ? 'opacity(100%) grayscale(100%) brightness(0%) invert()' : undefined)};
`;

interface IWalletConnectButtonProps {
	className?: string;
	updateShowWalletConnectModal: (showWalletConnectModal: boolean) => void;
	updateWalletConnectModalPosition: (x: number, y: number) => void;
}

class WalletConnectButton extends Component<IWalletConnectButtonProps> {
	readonly buttonElementId = uniqueId('WalletConnectButton-');
	resizeObserver: ResizeObserver | undefined;

	componentDidMount() {
		this.resizeObserver = new ResizeObserver(() => {
			this.updateWalletConnectModalPosition();
		});
		const element = document.getElementById(this.buttonElementId);
		if (element) {
			this.resizeObserver.observe(element);
		}
		window.addEventListener('resize', this.handleWindowResize);
		this.updateWalletConnectModalPosition();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleWindowResize);
		this.resizeObserver?.disconnect();
	}

	updateWalletConnectModalPosition = () => {
		const element = document.getElementById(this.buttonElementId);
		if (element) {
			const { x, y, height, width } = element.getBoundingClientRect();
			this.props.updateWalletConnectModalPosition(x + width, y + height + 30);
		}
	};

	handleWindowResize = (event: UIEvent) => {
		this.updateWalletConnectModalPosition();
	};

	handleOpen = () => {
		this.props.updateShowWalletConnectModal(true);
	};

	render() {
		const { className } = this.props;

		return (
			<>
				<StyledButton id={this.buttonElementId} className={className} onClick={this.handleOpen}>
					<Icon src={walletConnectIcon} />
				</StyledButton>
			</>
		);
	}
}

const mapDispatchToProps = (dispatch: IDispatch) => ({
	updateShowWalletConnectModal: (showWalletConnectModal: boolean) =>
		dispatch(updateShowWalletConnectModal(showWalletConnectModal)),
	updateWalletConnectModalPosition: (x: number, y: number) => dispatch(updateWalletConnectModalPosition(x, y)),
});

const walletConnectButton = connect(null, mapDispatchToProps)(WalletConnectButton);

export { walletConnectButton as WalletConnectButton };
