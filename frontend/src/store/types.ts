import { Action } from 'redux';

export type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
};

export type IActionType =
	| 'updateChain'
	| 'updateShowNetworkModal'
	| 'updateNetworkModalPosition'
	| 'updateSwapTokens'
	| 'updateChainCoinPrice'
	| 'addNotification'
	| 'markNotificationRead'
	| 'markAllNotificationsRead'
	| 'deleteNotifications'
	| 'updateMnemonic'
	| 'updatePassword'
	| 'login'
	| 'logout'
	| 'updateAskPasswordOnTransaction'
	| 'updateIsSessionTimeout'
	| 'updateActiveTimestamp'
	| 'updateTokens'
	| 'updateTransactions'
	| 'updateNonce'
	| 'updateNotifications'
	| 'updateShowWalletConnectModal'
	| 'updateWalletConnectModalPosition'
	| 'addHiddenToken'
	| 'deleteHiddenToken'
	| 'updateHiddenTokens';

export interface IAction<T extends IActionType> extends Action<IActionType> {
	type: T;
}

export interface IPayloadAction<T extends IActionType, U extends Record<string, unknown>> extends Action<IActionType> {
	type: T;
	payload: U;
}
