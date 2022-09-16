import { getCachedBalances } from 'cache/balances';
import { getCachedDecimals } from 'cache/decimals';
import { getCachedHistoryPriceInUSD } from 'cache/prices';
import { getCachedTokens } from 'cache/tokens';
import { chainIds } from 'constants/constants';
import { addCustomToken, getCustomTokens } from 'db/token';
import { getUserIdOrThrow } from 'db/user';
import { addHexPrefix, keccak256 } from 'ethereumjs-util';
import { Request, Response } from 'express';
import { IChain } from 'types';
import { cleanEthereumAddress, retry } from 'utils/base';
import { getToken } from 'utils/coingecko';
import { getBalances as covalenthq_getBalances, getTransactions as covalenthq_getTransactions } from 'utils/covalenthq';
import { ethereum } from 'utils/ethereum';
import { HttpError } from 'utils/httpError';
import { getChainInfo, parseSignedRequest, sendResponse } from 'utils/utils';
import { TransactionConfig, TransactionReceipt } from 'web3-core';

interface ISendTransactionRequest {
	chainId: bigint;
	signedTransaction: string;
}

interface ISendTransactionResponse {
	transactionReceipt: TransactionReceipt;
}

export const sendTransaction = async (req: Request, res: Response) => {
	const {
		payload: { chainId, signedTransaction },
	} = parseSignedRequest<ISendTransactionRequest>(req);
	const transactionReceipt = await retry(() => ethereum(chainId).sendSignedTransaction(signedTransaction));
	return sendResponse<ISendTransactionResponse>(res, { transactionReceipt });
};

interface IGetBalancesRequest {
	chainId: string;
	publicKey: string;
}

interface IGetBalancesResponse {
	data: Array<{
		tokenAddress: string;
		balance: string;
	}>;
}

export const getBalances = async (req: Request<{}, {}, IGetBalancesRequest>, res: Response<IGetBalancesResponse>) => {
	const { chainId, publicKey } = req.body;
	const balances = await covalenthq_getBalances(BigInt(chainId), publicKey);
	res.json({ data: balances.map(({ contract_address, balance }) => ({ tokenAddress: contract_address, balance })) });
};

interface IGetGasPriceRequest {
	chainId: string;
}

interface IGetGasPriceResponse {
	data: string;
}

export const getGasPrice = async (req: Request<{}, {}, IGetGasPriceRequest>, res: Response<IGetGasPriceResponse>) => {
	const { chainId } = req.body;
	const gasPrice = await retry(ethereum(BigInt(chainId)).getGasPrice);
	res.json({ data: addHexPrefix(gasPrice.toString(16)) });
};

interface IGetChainCoinPriceRequest {
	chainId: string;
}

interface IGetChainCoinPriceResponse {
	data: number;
}

export const getChainCoinPrice = async (
	req: Request<{}, {}, IGetChainCoinPriceRequest>,
	res: Response<IGetChainCoinPriceResponse>
) => {
	const { chainId } = req.body;
	let id: string;
	switch (BigInt(chainId)) {
		case 1n:
			id = 'ethereum';
			break;
		case 56n:
			id = 'binancecoin';
			break;
		case 137n:
			id = 'matic-network';
			break;
		default:
			throw new HttpError(400, 'Unknown chain id');
	}
	const {
		market_data: {
			current_price: { usd },
		},
	} = await getToken(id);
	res.json({ data: usd });
};

interface IGetWalletTokensRequest {
	chainId: bigint;
}

interface IGetWalletTokensResponse {
	tokens: Array<{
		tokenHash: string;
		chainId: bigint;
		address: string;
		name: string;
		symbol: string;
		logoUri: string;
		price: number | undefined;
		decimals: bigint;
		amount: bigint;
		amountInUSD: number;
		priceChangePercentage24h: number | undefined;
	}>;
}

export const getWalletTokens = async (req: Request, res: Response) => {
	const {
		publicKey,
		address,
		payload: { chainId },
	} = parseSignedRequest<IGetWalletTokensRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	const walletTokens = await getCachedBalances(chainId, address);
	const allTokens = await getCachedTokens();
	const customTokens = await getCustomTokens(userId);
	const tokens = walletTokens.map<IGetWalletTokensResponse['tokens'][0]>(
		({
			contract_address,
			contract_name,
			contract_ticker_symbol,
			logo_url,
			quote,
			quote_rate,
			contract_decimals,
			balance,
		}) => {
			const tokenHash = keccak256(
				Buffer.from(chainId.toString(16) + cleanEthereumAddress(contract_address), 'hex')
			).toString('hex');
			let priceChangePercentage24h: number | undefined;
			const statsToken = allTokens.find(({ symbol }) => symbol.toLowerCase() === contract_ticker_symbol.toLowerCase());
			if (statsToken) {
				priceChangePercentage24h = statsToken.price_change_percentage_24h;
			}
			return {
				tokenHash,
				chainId,
				address: contract_address,
				name: contract_name,
				symbol: contract_ticker_symbol,
				logoUri: logo_url,
				price: quote_rate,
				decimals: BigInt(contract_decimals),
				amount: BigInt(balance),
				amountInUSD: quote,
				priceChangePercentage24h,
			};
		}
	);
	const processedCustomTokens = customTokens
		.filter(
			(customToken) =>
				customToken.chainId === chainId &&
				!tokens.find(
					(token) =>
						token.chainId === customToken.chainId &&
						cleanEthereumAddress(token.address) === cleanEthereumAddress(customToken.address)
				)
		)
		.map<IGetWalletTokensResponse['tokens'][0]>(({ chainId, address, name, symbol, logoUri }) => {
			const tokenHash = keccak256(Buffer.from(chainId.toString(16) + cleanEthereumAddress(address), 'hex')).toString(
				'hex'
			);
			let logoUri2 = logoUri;
			let price: number | undefined;
			let priceChangePercentage24h: number | undefined;
			const statsToken = allTokens.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase());
			if (statsToken) {
				if (!logoUri2) {
					logoUri2 = statsToken.image;
				}
				price = statsToken.current_price;
				priceChangePercentage24h = statsToken.price_change_percentage_24h;
			}
			return {
				tokenHash,
				chainId,
				address,
				name,
				symbol,
				logoUri: logoUri2,
				price,
				decimals: 18n,
				amount: 0n,
				amountInUSD: 0,
				priceChangePercentage24h,
			};
		});
	return sendResponse<IGetWalletTokensResponse>(res, { tokens: [...tokens, ...processedCustomTokens] });
};

export const addWalletTokensToCustomTokens = async (req: Request, res: Response) => {
	const { publicKey, address } = parseSignedRequest<IGetWalletTokensRequest>(req);
	const userId = await getUserIdOrThrow(publicKey);
	for (const chainId of chainIds) {
		const covalenthqTokens = await getCachedBalances(chainId, address);
		for (const { contract_name, contract_ticker_symbol, logo_url, contract_address } of covalenthqTokens) {
			await addCustomToken(userId, chainId, contract_address, contract_name, contract_ticker_symbol, logo_url);
		}
	}
	return sendResponse(res, undefined);
};

interface IGetTransactionsRequest {
	chainId: bigint;
}

interface IGetTransactionsResponse {
	transactions: Array<{
		chainId: bigint;
		transactionHash: string;
		type: 'received' | 'sent' | 'exchanged' | 'transfered' | 'called';
		date: Date;
		successful: boolean;
		fromAddress: string;
		toAddress: string;
		value: bigint;
		valueUnit: string;
		usedGas: bigint;
		exchange?: {
			srcAddress: string;
			destAddress: string;
			srcTokenAddress: string;
			destTokenAddress: string;
			srcAmount: bigint;
			destAmount: bigint;
			srcDecimals: bigint;
			destDecimals: bigint;
		};
		transfer?: {
			srcAddress: string;
			destAddress: string;
			tokenAddress: string;
			amount: bigint;
			decimals: bigint;
		};
	}>;
}

export const getTransactions = async (req: Request, res: Response) => {
	const {
		address,
		payload: { chainId },
	} = parseSignedRequest<IGetTransactionsRequest>(req);
	const { symbol: valueUnit, oneInchRouterAddresses } = getChainInfo(chainId);
	const convalethqTransactions = await retry(() => covalenthq_getTransactions(chainId, address));
	const transactions = await Promise.all(
		convalethqTransactions.map<Promise<IGetTransactionsResponse['transactions'][0]>>(
			async ({
				tx_hash,
				block_signed_at,
				successful,
				from_address,
				to_address,
				value,
				fees_paid,
				log_events,
				gas_spent,
			}) => {
				let type: IGetTransactionsResponse['transactions'][0]['type'] = 'called';
				let exchange: IGetTransactionsResponse['transactions'][0]['exchange'] = undefined;
				let transfer: IGetTransactionsResponse['transactions'][0]['transfer'] = undefined;
				if (
					gas_spent === 21000 &&
					(cleanEthereumAddress(from_address) === cleanEthereumAddress(address) ||
						cleanEthereumAddress(to_address) === cleanEthereumAddress(address))
				) {
					if (BigInt(value) > 0n) {
						type = cleanEthereumAddress(to_address) === cleanEthereumAddress(address) ? 'received' : 'sent';
					}
				} else {
					if (oneInchRouterAddresses.includes(cleanEthereumAddress(to_address))) {
						for (const event of log_events) {
							if (
								oneInchRouterAddresses.includes(cleanEthereumAddress(event.sender_address)) &&
								event.raw_log_topics[0] === '0xd6d4f5681c246c9f42c203e287975af1601f8df8035a9251f79aab5c8f09e2f8'
							) {
								const srcAddress = cleanEthereumAddress(event.raw_log_data.slice(2).slice(64 * 0, 64 * 1));
								const srcTokenAddress = cleanEthereumAddress(event.raw_log_data.slice(2).slice(64 * 1, 64 * 2));
								const destTokenAddress = cleanEthereumAddress(event.raw_log_data.slice(2).slice(64 * 2, 64 * 3));
								const destAddress = cleanEthereumAddress(event.raw_log_data.slice(2).slice(64 * 3, 64 * 4));
								const srcAmount = BigInt(addHexPrefix(event.raw_log_data.slice(2).slice(64 * 4, 64 * 5)));
								const destAmount = BigInt(addHexPrefix(event.raw_log_data.slice(2).slice(64 * 5, 64 * 6)));
								const srcDecimals = await getCachedDecimals(chainId, srcTokenAddress);
								const destDecimals = await getCachedDecimals(chainId, destTokenAddress);
								exchange = {
									srcAddress,
									destAddress,
									srcTokenAddress,
									destTokenAddress,
									srcAmount,
									destAmount,
									srcDecimals,
									destDecimals,
								};
								type = 'exchanged';
								break;
							}
						}
					} else {
						let transferCounter = 0n;
						for (const event of log_events) {
							if (event.raw_log_topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
								if (
									cleanEthereumAddress(event.raw_log_topics[1]) === cleanEthereumAddress(address) ||
									cleanEthereumAddress(event.raw_log_topics[2]) === cleanEthereumAddress(address)
								) {
									if (transferCounter > 0n) {
										transfer = undefined;
										type = 'called';
									} else {
										const decimals = await getCachedDecimals(chainId, to_address);
										transfer = {
											srcAddress: cleanEthereumAddress(event.raw_log_topics[1]),
											destAddress: cleanEthereumAddress(event.raw_log_topics[2]),
											tokenAddress: to_address,
											amount: BigInt(event.raw_log_data),
											decimals,
										};
										type = 'transfered';
									}
									transferCounter += 1n;
								}
							}
						}
					}
				}
				return {
					chainId,
					transactionHash: tx_hash,
					type,
					date: new Date(block_signed_at),
					successful,
					fromAddress: from_address,
					toAddress: to_address,
					value: BigInt(value),
					valueUnit,
					usedGas: BigInt(fees_paid),
					exchange,
					transfer,
				};
			}
		)
	);
	return sendResponse<IGetTransactionsResponse>(res, { transactions });
};

interface IGetTransactionInfoRequest {
	chainId: bigint;
	transactionHash: string;
	date: Date;
}

interface IGetTransactionInfoResponse {
	transactionInfo: {
		chainId: bigint;
		transactionHash: string;
		nonce: bigint;
		valuePriceInUSD: number;
	};
}

export const getTransactionInfo = async (req: Request, res: Response) => {
	const {
		payload: { chainId, transactionHash, date },
	} = parseSignedRequest<IGetTransactionInfoRequest>(req);
	const { nonce } = await retry(() => ethereum(chainId).getTransaction(transactionHash));
	const { chain } = getChainInfo(chainId);
	const valuePriceInUSD = await getCachedHistoryPriceInUSD(chain, date);
	return sendResponse<IGetTransactionInfoResponse>(res, {
		transactionInfo: { chainId, transactionHash, nonce: BigInt(nonce), valuePriceInUSD },
	});
};

interface IGetNonceRequest {
	chainId: bigint;
}

interface IGetNonceResponse {
	nonce: bigint;
}

export const getNonce = async (req: Request, res: Response) => {
	const {
		address,
		payload: { chainId },
	} = parseSignedRequest<IGetNonceRequest>(req);
	const nonce = await retry(() => ethereum(chainId).getTransactionCount(addHexPrefix(address), 'pending'));
	return sendResponse<IGetNonceResponse>(res, {
		nonce: BigInt(nonce),
	});
};

interface IEstimateGasRequest {
	chainId: bigint;
	transactionData: TransactionConfig;
}

interface IEstimateGasResponse {
	gas: bigint;
}

export const estimateGas = async (req: Request, res: Response) => {
	const {
		payload: { chainId, transactionData },
	} = parseSignedRequest<IEstimateGasRequest>(req);
	const gas = await retry(() => ethereum(chainId).estimateGas(transactionData));
	return sendResponse<IEstimateGasResponse>(res, {
		gas: BigInt(gas),
	});
};

interface IGetHistoricValuePriceRequest {
	chain: IChain;
	date: Date;
}

interface IGetHistoricValuePriceResponse {
	valuePriceInUSD: number;
}

export const getHistoricValuePrice = async (req: Request, res: Response) => {
	const {
		payload: { chain, date },
	} = parseSignedRequest<IGetHistoricValuePriceRequest>(req);
	const valuePriceInUSD = await getCachedHistoryPriceInUSD(chain, date);
	return sendResponse<IGetHistoricValuePriceResponse>(res, { valuePriceInUSD });
};
