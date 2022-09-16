import bitcoinBanner from 'assets/images/networks/bitcoinBanner.png';
import bitcoinLogo from 'assets/images/networks/bitcoinLogo.png';
import bscBanner from 'assets/images/networks/bscBanner.png';
import bscLogo from 'assets/images/networks/bscLogo.png';
import ethereumBanner from 'assets/images/networks/ethereumBanner.png';
import ethereumLogo from 'assets/images/networks/ethereumLogo.png';
import polygonBanner from 'assets/images/networks/polygonBanner.png';
import polygonLogo from 'assets/images/networks/polygonLogo.png';
import { INetwork } from 'types';

export const networks: Array<INetwork> = [
	{
		chain: 'bsc',
		chainId: 56n,
		label: 'BSC',
		logo: bscLogo,
		banner: bscBanner,
		getTransactionLink: (transactionHash: string) => `https://bscscan.com/tx/${transactionHash}`,
		explorerName: 'BscScan',
		symbol: 'BNB',
	},
	{
		chain: 'ethereum',
		chainId: 1n,
		label: 'Ethereum',
		logo: ethereumLogo,
		banner: ethereumBanner,
		getTransactionLink: (transactionHash: string) => `https://etherscan.com/tx/${transactionHash}`,
		explorerName: 'EtherScan',
		symbol: 'ETH',
	},
	{
		chain: 'polygon',
		chainId: 137n,
		label: 'Polygon',
		logo: polygonLogo,
		banner: polygonBanner,
		getTransactionLink: (transactionHash: string) => `https://polygonscan.com/tx/${transactionHash}`,
		explorerName: 'PolygonScan',
		symbol: 'MATIC',
	},
	{
		chain: 'bitcoin',
		label: 'Bitcoin',
		logo: bitcoinLogo,
		banner: bitcoinBanner,
		getTransactionLink: (transactionHash: string) => `https://www.blockchain.com/btc-testnet/tx/${transactionHash}`,
		explorerName: '',
		symbol: 'BTC',
	},
];
