import { IPayloadAction } from 'store/types';

export interface IWalletConnectState {
	showWalletConnectModal: boolean;
	walletConnectModalPosition: { x: number; y: number };
}

type IUpdateShowWalletConnectModal = IPayloadAction<
	'updateShowWalletConnectModal',
	{ showWalletConnectModal: boolean }
>;

type IUpdateWalletConnectModalPosition = IPayloadAction<
	'updateWalletConnectModalPosition',
	{ walletConnectModalPosition: { x: number; y: number } }
>;

export type IWalletConnectAction = IUpdateShowWalletConnectModal | IUpdateWalletConnectModalPosition;
