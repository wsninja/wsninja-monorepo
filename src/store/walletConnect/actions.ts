import { IWalletConnectAction } from 'store/walletConnect/types';

export const updateShowWalletConnectModal = (showWalletConnectModal: boolean): IWalletConnectAction => ({
	type: 'updateShowWalletConnectModal',
	payload: { showWalletConnectModal },
});

export const updateWalletConnectModalPosition = (x: number, y: number): IWalletConnectAction => ({
	type: 'updateWalletConnectModalPosition',
	payload: { walletConnectModalPosition: { x, y } },
});
