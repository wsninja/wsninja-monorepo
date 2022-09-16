import { ISwapAction, ISwapState } from 'store/swap/types';

export const initialSwapState: ISwapState = {
	tokens: [],
	tokenFilters: [],
};

export const swapReducer = (state = initialSwapState, action: ISwapAction): ISwapState => {
	switch (action.type) {
		case 'updateSwapTokens':
			return { ...state, tokens: action.payload.tokens };
		default:
			return state;
	}
};
