import { IStringIndexed } from 'types';
import { cleanEthereumAddress, retry } from 'utils/base';
import { erc20 } from 'utils/ethereum';

const decimalsCache = new Array<IStringIndexed<bigint>>();

export const getCachedDecimals = async (chainId: bigint, contractAddress: string): Promise<bigint> => {
	if (cleanEthereumAddress(contractAddress) === 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
		return 18n;
	}
	const chain = decimalsCache[Number(chainId)];
	if (chain !== undefined) {
		const decimals = chain[cleanEthereumAddress(contractAddress)];
		if (decimals !== undefined) {
			return decimals;
		}
	}
	const decimals = await retry(erc20(chainId, contractAddress).call.decimals);
	if (decimalsCache[Number(chainId)] === undefined) {
		decimalsCache[Number(chainId)] = {};
	}
	decimalsCache[Number(chainId)][cleanEthereumAddress(contractAddress)] = decimals;
	return decimals;
};
