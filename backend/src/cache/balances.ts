import { cleanEthereumAddress } from 'utils/base';
import { getBalances, ICovalenthqBalancesResponse } from 'utils/covalenthq';

const balancesCacheAge = 1000 * 60; // ms

let balancesCache: Array<{
	chainId: bigint;
	address: string;
	timestamp: number;
	balances: ICovalenthqBalancesResponse['data']['items'];
}> = [];

export const getCachedBalances = async (
	chainId: bigint,
	address: string
): Promise<ICovalenthqBalancesResponse['data']['items']> => {
	address = cleanEthereumAddress(address);
	const index = balancesCache.findIndex((entry) => entry.chainId === chainId && entry.address === address);
	if (index === -1) {
		const timestamp = Date.now();
		const balances = await getBalances(chainId, address);
		if (chainId === 137n) {
			const index = balances.findIndex(
				({ contract_address }) => cleanEthereumAddress(contract_address) === '0000000000000000000000000000000000001010'
			);
			if (index >= 0) {
				balances[index].contract_address = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
			}
		}
		if (!balancesCache.find((entry) => entry.chainId === chainId && entry.address === address)) {
			balancesCache.push({ chainId, address, timestamp, balances });
		}
		return balances;
	} else if (balancesCache[index].timestamp < Date.now() - balancesCacheAge) {
		const timestamp = Date.now();
		const balances = await getBalances(chainId, address);
		if (chainId === 137n) {
			const index = balances.findIndex(
				({ contract_address }) => cleanEthereumAddress(contract_address) === '0000000000000000000000000000000000001010'
			);
			if (index >= 0) {
				balances[index].contract_address = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
			}
		}
		balancesCache[index] = { chainId, address, timestamp, balances };
		return balances;
	} else {
		return balancesCache[index].balances;
	}
};
