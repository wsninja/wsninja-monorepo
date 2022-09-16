import { IChainInfo } from 'types';
import { cleanEthereumAddress } from 'utils/base';

export const chainIds = [1n, 56n, 137n];

export const chains: Array<IChainInfo> = [
	{
		chain: 'ethereum',
		chainId: 1n,
		name: 'Ethereum',
		symbol: 'ETH',
		logoUri: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
		oneInchRouterAddresses: [],
		coinGeckoId: 'ethereum',
	},
	{
		chain: 'bsc',
		chainId: 56n,
		name: 'BNB',
		symbol: 'BNB',
		logoUri: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
		oneInchRouterAddresses: [],
		coinGeckoId: 'binancecoin',
	},
	{
		chain: 'polygon',
		chainId: 137n,
		name: 'MATIC',
		symbol: 'MATIC',
		logoUri: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
		oneInchRouterAddresses: [cleanEthereumAddress('1111111254fb6c44bac0bed2854e76f90643097d')],
		coinGeckoId: 'matic-network',
	},
	{
		chain: 'bitcoin',
		name: 'Bitcoin',
		symbol: 'BTC',
		logoUri: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
		oneInchRouterAddresses: [],
		coinGeckoId: 'bitcoin',
	},
];
