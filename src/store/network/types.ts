import { IPayloadAction } from 'store/types';
import { IChain } from 'types';

export interface INetworkState {
	chain: IChain;
	networkModalPosition: { x: number; y: number };
	chainCoinPrice: number | undefined;
	chainCoinPriceTimestamp: number;
}

type IUpdateChain = IPayloadAction<'updateChain', { chain: IChain }>;

type IUpdateNetworkModalPosition = IPayloadAction<
	'updateNetworkModalPosition',
	{ networkModalPosition: { x: number; y: number } }
>;

type IUpdateChainCoinPrice = IPayloadAction<
	'updateChainCoinPrice',
	{ chainCoinPrice: number; chainCoinPriceTimestamp: number }
>;

export type INetworkAction = IUpdateChain | IUpdateNetworkModalPosition | IUpdateChainCoinPrice;
