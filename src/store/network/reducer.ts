import { INetworkAction, INetworkState } from 'store/network/types';

export const initialNetworkState: INetworkState = {
	chain: 'polygon',
	networkModalPosition: { x: 0, y: 0 },
	chainCoinPrice: undefined,
	chainCoinPriceTimestamp: 0,
};

export const networkReducer = (state = initialNetworkState, action: INetworkAction): INetworkState => {
	switch (action.type) {
		case 'updateChain':
			return { ...state, chain: action.payload.chain };
		case 'updateNetworkModalPosition':
			return { ...state, networkModalPosition: action.payload.networkModalPosition };
		case 'updateChainCoinPrice':
			if (action.payload.chainCoinPriceTimestamp > state.chainCoinPriceTimestamp) {
				return {
					...state,
					chainCoinPrice: action.payload.chainCoinPrice,
					chainCoinPriceTimestamp: action.payload.chainCoinPriceTimestamp,
				};
			}
			return state;
		default:
			return state;
	}
};
