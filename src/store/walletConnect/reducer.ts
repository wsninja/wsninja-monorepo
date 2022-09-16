import { IWalletConnectAction, IWalletConnectState } from 'store/walletConnect/types';

export const initialWalletConnectState: IWalletConnectState = {
	showWalletConnectModal: false,
	walletConnectModalPosition: { x: 0, y: 0 },
};

export const walletConnectReducer = (
	state = initialWalletConnectState,
	action: IWalletConnectAction
): IWalletConnectState => {
	switch (action.type) {
		case 'updateShowWalletConnectModal':
			return { ...state, showWalletConnectModal: action.payload.showWalletConnectModal };
		case 'updateWalletConnectModalPosition':
			return { ...state, walletConnectModalPosition: action.payload.walletConnectModalPosition };
		default:
			return state;
	}
};
