import { ISwapTokenFilter } from 'types';

export const defaultTokenFilters: Array<ISwapTokenFilter> = [
	// Ethereum
	{ chainId: 1n, address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' }, // ETH
	{ chainId: 1n, address: '0x111111111117dc0aa78b770fa6a738034120c302' }, // 1INCH
	{ chainId: 1n, address: '0xdac17f958d2ee523a2206206994597c13d831ec7' }, // USDT

	// Binance Smart Chain
	{ chainId: 56n, address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' }, // BNB
	{ chainId: 56n, address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8' }, // WETH
	{ chainId: 56n, address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' }, // BUSD

	// Polygon
	{ chainId: 137n, address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' }, // MATIC
	{ chainId: 137n, address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619' }, // WETH
	{ chainId: 137n, address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B' }, // AAVE
];
