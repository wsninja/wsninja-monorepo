import { MessageToast } from 'components/messageToast/messageToast';
import { addHexPrefix } from 'ethereumjs-util';
import { toast } from 'react-toastify';
import { IChain, IToken, ITransaction } from 'types';
import { cleanEthereumAddress, tokenToString } from 'utils/utils';

export const renderTransactionAmount = (transaction: ITransaction, token: IToken, walletAddress: string): string => {
	switch (transaction.type) {
		case 'received':
			return `${tokenToString(transaction.value, token.decimals)} ${token.symbol}`;
		case 'sent':
		case 'called':
			return `${transaction.value === 0n ? '' : '-'}${tokenToString(transaction.value, token.decimals)} ${
				token.symbol
			}`;
		case 'exchanged':
			if (!transaction.exchange) {
				return `NA ${token.symbol}`;
			}
			if (cleanEthereumAddress(transaction.exchange.srcTokenAddress) === cleanEthereumAddress(token.address)) {
				return `${transaction.exchange.srcAmount === 0n ? '' : '-'}${tokenToString(
					transaction.exchange.srcAmount,
					transaction.exchange.srcDecimals
				)} ${token.symbol}`;
			}
			return `${tokenToString(transaction.exchange.destAmount, transaction.exchange.destDecimals)} ${token.symbol}`;
		case 'transfered':
			if (!transaction.transfer) {
				return `NA ${token.symbol}`;
			}
			if (cleanEthereumAddress(transaction.transfer.srcAddress) === cleanEthereumAddress(walletAddress)) {
				return `${transaction.transfer.amount === 0n ? '' : '-'}${tokenToString(
					transaction.transfer.amount,
					transaction.transfer.decimals
				)} ${token.symbol}`;
			}
			return `${tokenToString(transaction.transfer.amount, transaction.transfer.decimals)} ${token.symbol}`;
	}
};

export const errorToast = (message: string) => toast(<MessageToast icon="warning" heading="Error" message={message} />);

export const messageToast = (message: string) => toast(<MessageToast icon="info" message={message} />);

export const toNiceAddress = (chain: IChain, address: string) => {
	switch (chain) {
		case 'bitcoin':
			return address;
		case 'bsc':
		case 'ethereum':
		case 'polygon':
			return addHexPrefix(cleanEthereumAddress(address));
	}
};
