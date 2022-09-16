import { INetworkAction } from 'store/network/types';
import { IChain } from 'types';

export const updateChain = (chain: IChain): INetworkAction => ({ type: 'updateChain', payload: { chain } });

export const updateNetworkModalPosition = (networkModalPosition: { x: number; y: number }): INetworkAction => ({
	type: 'updateNetworkModalPosition',
	payload: { networkModalPosition },
});

export const updateChainCoinPrice = (chainCoinPrice: number, chainCoinPriceTimestamp: number): INetworkAction => ({
	type: 'updateChainCoinPrice',
	payload: { chainCoinPrice, chainCoinPriceTimestamp },
});
