import { IWalletAction, IWalletState } from 'store/wallet/types';
import { cleanEthereumAddress } from 'utils/utils';

export const initialWalletState: IWalletState = {
	tokens: [],
	transactions: [],
	hiddenTokens: [],
};

export const walletReducer = (state = initialWalletState, action: IWalletAction): IWalletState => {
	switch (action.type) {
		case 'updateTokens':
			return { ...state, tokens: action.payload.tokens };
		case 'updateTransactions':
			return { ...state, transactions: action.payload.transactions };
		case 'addHiddenToken':
			return {
				...state,
				hiddenTokens: [
					...state.hiddenTokens.filter(
						({ chainId, address }) =>
							action.payload.chainId !== chainId ||
							cleanEthereumAddress(action.payload.address) !== cleanEthereumAddress(address)
					),
					action.payload,
				],
			};
		case 'deleteHiddenToken':
			return {
				...state,
				hiddenTokens: state.hiddenTokens.filter(
					({ chainId, address }) =>
						action.payload.chainId !== chainId ||
						cleanEthereumAddress(action.payload.address) !== cleanEthereumAddress(address)
				),
			};
		case 'updateHiddenTokens':
			return { ...state, hiddenTokens: action.payload.hiddenTokens };
		default:
			return state;
	}
};
