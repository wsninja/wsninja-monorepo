import bitcoinLogo from 'assets/images/networks/bitcoinLogo.png';
import BigNumber from 'bignumber.js';
import { messageToast } from 'components/utils';
import { WsnToast } from 'components/wsnToast/wsnToast';
import { bitcoinTokenHash } from 'constants/constants';
import erc20Abi from 'constants/erc20.json';
import { addHexPrefix } from 'ethereumjs-util';
import { CoinsView } from 'pages/wallet/coins/coinsView';
import { ICoinTab, IHistoryFilter } from 'pages/wallet/types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { IDispatch, IRootState } from 'store/store';
import { updateTokens, updateTransactions } from 'store/wallet/actions';
import { IChain, IToken, ITransaction, ITransactionInfo } from 'types';
import {
	estimateGas,
	getGasPrice,
	getNonce,
	getTokenPrice,
	getTransactionInfo,
	getTransactions,
	getWalletTokens,
} from 'utils/api/api';
import { getHistoricValuePrice } from 'utils/api/wallet/wallet';
import { sendTransaction } from 'utils/bitcoin';
import { getBalance, getTransactions as blockcyphter_getTransactions } from 'utils/blockcypher';
import { getBitcoinKeys, getEthereumKeys } from 'utils/crypto';
import { sendBaseTransaction } from 'utils/ethereum';
import { addHiddenToken, deleteHiddenToken, getHiddenTokens } from 'utils/hiddenTokens';
import { addNotification } from 'utils/notification';
import {
	bigintToBigNumber,
	bigNumberToBigint,
	cleanEthereumAddress,
	errorToString,
	getChain,
	getChainId,
	getTransactionLink,
	isBitcoinChain,
	isEthereumChain,
	toHex,
	tokenToString,
} from 'utils/utils';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';
import { AbiItem } from 'web3-utils';
import './Coins.scss';

interface ICoinsProps {
	currentTab: ICoinTab;
	historyFilter: IHistoryFilter;
	showTokenSelector: boolean;
	onCloseTokenSelector: () => void;
	// Redux
	chain: IChain;
	mnemonic: string;
	securityToken: string;
	tokens: Array<IToken>;
	hiddenTokens: Array<{ chainId: bigint; address: string }>;
	transactions: Array<ITransaction>;
	askPasswordOnTransaction: boolean;
	updateTokens: (tokens: Array<IToken>) => void;
	updateTransactions: (transactions: Array<ITransaction>) => void;
}

interface ICoinsState {
	filteredTokens: Array<IToken>;
	selectedToken: IToken | undefined;
	filteredTransactions: Array<ITransaction>;
	selectedTransaction: ITransaction | undefined;
	transactionInfo: ITransactionInfo | undefined;
	totalAmountInUSD: number;
	searchText: string;
	recipientAddress: string;
	sendAmount: string;
	sendAmountIsUSD: boolean;
	sendFee: number;
	isAskingPassword: boolean;
	isSending: boolean;
	address: string;
	privateKey: string;
}

class Coins extends Component<ICoinsProps, ICoinsState> {
	sendFeeTimestamp = 0;

	constructor(props: ICoinsProps) {
		super(props);
		const { mnemonic, chain } = props;
		const { address, privateKey } = isEthereumChain(chain) ? getEthereumKeys(mnemonic) : getBitcoinKeys(mnemonic);
		this.state = {
			filteredTokens: [],
			selectedToken: undefined,
			filteredTransactions: [],
			selectedTransaction: undefined,
			transactionInfo: undefined,
			totalAmountInUSD: 0,
			searchText: '',
			recipientAddress: '',
			sendAmount: '',
			sendAmountIsUSD: false,
			sendFee: NaN,
			isAskingPassword: false,
			isSending: false,
			address,
			privateKey,
		};
	}

	async componentDidMount() {
		const { securityToken } = this.props;
		getHiddenTokens(securityToken);
		this.updateTokens();
		this.updateTransactions();
		this.updateTotalAmountInUSD();
	}

	async componentDidUpdate(prevProps: ICoinsProps, prevState: ICoinsState) {
		const { chain, historyFilter, tokens, transactions, mnemonic, showTokenSelector, hiddenTokens } = this.props;
		const { selectedToken, searchText, selectedTransaction, recipientAddress, sendAmount, filteredTokens } = this.state;
		if (prevProps.chain !== chain) {
			this.updateAddress();
			this.updateTokens();
		}
		if (prevProps.tokens !== tokens || prevState.searchText !== searchText) {
			this.updateFilteredTokens();
		}
		if (prevProps.chain !== chain) {
			this.updateTransactions();
		}
		if (
			prevProps.chain !== chain ||
			prevProps.historyFilter !== historyFilter ||
			prevState.selectedToken !== selectedToken ||
			prevProps.transactions !== transactions
		) {
			this.updateFilteredTransactions();
		}
		if (prevState.selectedTransaction !== selectedTransaction) {
			this.updateTransactionInfo();
		}
		if (prevProps.hiddenTokens !== hiddenTokens || prevState.filteredTokens !== filteredTokens) {
			this.updateTotalAmountInUSD();
		}
		if (
			prevProps.chain !== chain ||
			prevState.filteredTokens !== filteredTokens ||
			prevProps.hiddenTokens !== hiddenTokens
		) {
			this.resetSelectedToken();
		}
		if (prevProps.chain !== chain || prevState.selectedToken !== selectedToken) {
			this.resetSelectedTransaction();
		}
		if (
			prevProps.chain !== chain ||
			prevState.selectedToken !== selectedToken ||
			prevState.recipientAddress !== recipientAddress ||
			new BigNumber(prevState.sendAmount).isFinite() !== new BigNumber(sendAmount).isFinite()
		) {
			this.updateSendFee();
		}
		if (prevProps.mnemonic !== mnemonic) {
			this.updateKeys();
		}
		if (prevProps.showTokenSelector !== showTokenSelector) {
			this.handleChangeSearchText('');
		}
	}

	updateAddress = () => {
		const { mnemonic, chain } = this.props;
		const { address, privateKey } = isEthereumChain(chain) ? getEthereumKeys(mnemonic) : getBitcoinKeys(mnemonic);
		this.setState({ address, privateKey });
	};

	updateTokens = async () => {
		const { chain, securityToken, mnemonic } = this.props;
		let newTokens = new Array<IToken>();
		try {
			if (isEthereumChain(chain)) {
				const chainId = getChainId(chain);
				newTokens = await getWalletTokens({ chainId }, securityToken);
			} else if (isBitcoinChain(chain)) {
				const { address } = getBitcoinKeys(mnemonic);
				const decimals = 8n;
				const amount = await getBalance(address);
				const { tokenPrice } = await getTokenPrice({ tokenSymbol: 'BTC' }, securityToken);
				const price = tokenPrice?.price;
				const amountInUSD = price === undefined ? 0 : bigintToBigNumber(amount, decimals).times(price).toNumber();
				newTokens = [
					{
						chain: 'bitcoin',
						tokenHash: bitcoinTokenHash,
						address: '',
						name: 'Bitcoin',
						symbol: 'BTC',
						logoUri: bitcoinLogo,
						price,
						decimals,
						amount,
						amountInUSD,
						priceChangePercentage24h: tokenPrice?.priceChangePercentage24h ?? undefined,
					},
				];
			}
		} finally {
			this.props.updateTokens(newTokens);
		}
	};

	updateTotalAmountInUSD = () => {
		const { hiddenTokens } = this.props;
		const { filteredTokens } = this.state;
		let totalAmountInUSD = 0;
		filteredTokens
			.filter(
				(token) =>
					!hiddenTokens.find(
						({ chainId, address }) =>
							token.chain === getChain(chainId) && cleanEthereumAddress(token.address) === cleanEthereumAddress(address)
					)
			)
			.forEach((token) => (totalAmountInUSD += token.amountInUSD));
		this.setState({ totalAmountInUSD });
	};

	updateFilteredTokens = () => {
		const { tokens, hiddenTokens } = this.props;
		const { searchText, selectedToken } = this.state;
		const filteredTokens = searchText
			? tokens.filter(
					({ name, symbol }) =>
						name.toLowerCase().includes(searchText.toLowerCase()) ||
						symbol.toLowerCase().includes(searchText.toLowerCase())
			  )
			: tokens;
		const visibleTokens = filteredTokens.filter(
			(token) =>
				!hiddenTokens.find(
					({ chainId, address }) =>
						token.chain === getChain(chainId) && cleanEthereumAddress(token.address) === cleanEthereumAddress(address)
				)
		);
		if (selectedToken === undefined && visibleTokens.length > 0) {
			this.setState({ filteredTokens, selectedToken: visibleTokens[0] });
		} else {
			this.setState({ filteredTokens });
		}
	};

	updateTransactions = async () => {
		const { chain, securityToken, mnemonic } = this.props;
		if (isEthereumChain(chain)) {
			const chainId = getChainId(chain);
			const transactions = await getTransactions({ chainId }, securityToken);
			this.props.updateTransactions(transactions);
		} else if (isBitcoinChain(chain)) {
			const { address } = getBitcoinKeys(mnemonic);
			const transactions = await blockcyphter_getTransactions(address);
			this.props.updateTransactions(transactions);
		} else {
			this.props.updateTransactions([]);
		}
	};

	updateFilteredTransactions = () => {
		const { historyFilter, transactions, mnemonic, chain } = this.props;
		const { selectedToken } = this.state;
		if (isEthereumChain(chain)) {
			const { address } = getEthereumKeys(mnemonic);
			const cleanWalletAddress = cleanEthereumAddress(address ?? '');
			const cleanTokenAddress = cleanEthereumAddress(selectedToken?.address ?? '');
			const filteredTransactions = transactions
				.filter(
					({ toAddress, exchange, transfer, type }) =>
						(cleanTokenAddress === 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' &&
							(type === 'received' || type === 'sent')) ||
						cleanEthereumAddress(toAddress) === cleanTokenAddress ||
						(exchange &&
							((cleanEthereumAddress(exchange.srcTokenAddress) === cleanTokenAddress &&
								cleanEthereumAddress(exchange.srcAddress) === cleanWalletAddress) ||
								(cleanEthereumAddress(exchange.destTokenAddress) === cleanTokenAddress &&
									cleanEthereumAddress(exchange.destAddress) === cleanWalletAddress))) ||
						(transfer && cleanEthereumAddress(transfer.tokenAddress) === cleanTokenAddress)
				)
				.filter(
					({ type }) =>
						historyFilter === 'all' ||
						(historyFilter === 'received' && type === 'received') ||
						(historyFilter === 'sent' && type === 'sent') ||
						(historyFilter === 'exchanged' && type === 'exchanged') ||
						(historyFilter === 'call' && (type === 'transfered' || type === 'called'))
				);
			this.setState({ filteredTransactions });
		} else if (isBitcoinChain(chain)) {
			const filteredTransactions = transactions.filter(
				({ type }) =>
					historyFilter === 'all' ||
					(historyFilter === 'received' && type === 'received') ||
					(historyFilter === 'sent' && type === 'sent') ||
					(historyFilter === 'exchanged' && type === 'exchanged') ||
					(historyFilter === 'call' && (type === 'transfered' || type === 'called'))
			);
			this.setState({ filteredTransactions });
		} else {
			this.setState({ filteredTransactions: [] });
		}
	};

	updateTransactionInfo = async () => {
		const { chain, securityToken } = this.props;
		const { selectedTransaction } = this.state;
		if (!selectedTransaction) {
			this.setState({ transactionInfo: undefined });
			return;
		}
		if (isEthereumChain(chain)) {
			const chainId = getChainId(chain);
			const transactionInfo = await getTransactionInfo(
				{ chainId, transactionHash: selectedTransaction.transactionHash, date: selectedTransaction.date },
				securityToken
			);
			this.setState({ transactionInfo });
		} else {
			const { valuePriceInUSD } = await getHistoricValuePrice({ chain, date: selectedTransaction.date }, securityToken);
			const transactionInfo: ITransactionInfo = {
				chain: 'bitcoin',
				transactionHash: selectedTransaction?.transactionHash,
				nonce: 0n,
				valuePriceInUSD,
			};
			this.setState({ transactionInfo });
		}
	};

	updateSendFee = async () => {
		const { chain, securityToken, tokens, mnemonic } = this.props;
		const { recipientAddress, sendAmount, selectedToken, sendAmountIsUSD } = this.state;
		let sendFee = NaN;
		const timestamp = Date.now();
		try {
			if (isEthereumChain(chain)) {
				if (selectedToken && selectedToken.price !== undefined && recipientAddress && new BigNumber(sendAmount).gt(0)) {
					const { address } = getEthereumKeys(mnemonic);
					const chainId = getChainId(chain);
					const gasPrice = await getGasPrice(chainId);
					const { nonce } = await getNonce({ chainId }, securityToken);
					let gasUsage = 0n;
					if (cleanEthereumAddress(selectedToken.address) === 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
						const value = (
							sendAmountIsUSD ? new BigNumber(sendAmount).div(selectedToken.price) : new BigNumber(sendAmount)
						)
							.times(10 ** 18)
							.integerValue()
							.toString();
						const transactionConfig: TransactionConfig = {
							from: addHexPrefix(address),
							to: addHexPrefix(recipientAddress),
							value,
							gasPrice: toHex(gasPrice),
							nonce: Number(nonce),
						};
						const { gas } = await estimateGas({ chainId, transactionData: transactionConfig }, securityToken);
						gasUsage = gas * gasPrice;
					} else {
						const value = (
							sendAmountIsUSD ? new BigNumber(sendAmount).div(selectedToken.price) : new BigNumber(sendAmount)
						)
							.times(10 ** Number(selectedToken.decimals))
							.integerValue()
							.toString(16);
						const transactionConfig: TransactionConfig = {
							from: addHexPrefix(address),
							to: addHexPrefix(selectedToken.address),
							gasPrice: toHex(gasPrice),
							nonce: Number(nonce),
						};
						const web3 = new Web3(Web3.givenProvider);
						const erc20 = new web3.eth.Contract(erc20Abi as Array<AbiItem>);
						transactionConfig.data = erc20.methods
							.transfer(addHexPrefix(recipientAddress), addHexPrefix(value))
							.encodeABI();
						const { gas } = await estimateGas({ chainId, transactionData: transactionConfig }, securityToken);
						gasUsage = gas * gasPrice;
					}
					const gasToken = tokens.find(
						(token) => cleanEthereumAddress(token.address) === 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
					);
					if (gasToken && gasToken.price !== undefined) {
						sendFee = bigintToBigNumber(gasUsage, 18n).times(gasToken.price).toNumber();
					}
				}
			}
		} catch {
		} finally {
			if (timestamp > this.sendFeeTimestamp) {
				this.sendFeeTimestamp = timestamp;
				this.setState({ sendFee });
			}
		}
	};

	updateKeys = () => {
		const { mnemonic, chain } = this.props;
		if (isEthereumChain(chain)) {
			const { address, privateKey } = getEthereumKeys(mnemonic);
			this.setState({ address, privateKey });
		} else if (isBitcoinChain(chain)) {
			const { address, privateKey } = getBitcoinKeys(mnemonic);
			this.setState({ address, privateKey });
		} else {
			this.setState({ address: '', privateKey: '' });
		}
	};

	resetSelectedToken = () => {
		const { chain, hiddenTokens } = this.props;
		const { selectedToken, filteredTokens } = this.state;
		if (isEthereumChain(chain)) {
			const visibleTokens = filteredTokens.filter(
				(token) =>
					!hiddenTokens.find(
						({ chainId, address }) =>
							token.chain === getChain(chainId) && cleanEthereumAddress(token.address) === cleanEthereumAddress(address)
					)
			);
			if (selectedToken?.chain !== chain) {
				if (visibleTokens.length) {
					this.setState({ selectedToken: visibleTokens[0] });
				} else {
					this.setState({ selectedToken: undefined });
				}
			}
		} else if (isBitcoinChain(chain)) {
			if (filteredTokens.length > 0) {
				this.setState({ selectedToken: filteredTokens[0] });
			} else {
				this.setState({ selectedToken: undefined });
			}
		}
	};

	resetSelectedTransaction = () => {
		this.setState({ selectedTransaction: undefined });
	};

	handleChangeSearchText = (searchText: string) => {
		this.setState({ searchText });
	};

	handleSelectToken = (selectedToken: IToken) => {
		this.setState({ selectedToken });
	};

	handleAddHiddenToken = (chainId: bigint, address: string) => {
		const { securityToken } = this.props;
		addHiddenToken(chainId, address, securityToken);
	};

	handleDeleteHiddenToken = (chainId: bigint, address: string) => {
		const { securityToken } = this.props;
		deleteHiddenToken(chainId, address, securityToken);
	};

	handleSelectTransaction = (selectedTransaction: ITransaction) => {
		this.setState({ selectedTransaction });
	};

	handleChangeSendAmountIsUSD = (sendAmountIsUSD: boolean) => {
		this.setState({ sendAmountIsUSD });
	};

	handleChangeRecipientAddress = (recipientAddress: string) => {
		this.setState({ recipientAddress });
	};

	handleChangeSendAmount = (sendAmount: string) => {
		this.setState({ sendAmount });
	};

	handleMax = async () => {
		const { chain } = this.props;
		const { selectedToken, sendAmountIsUSD } = this.state;
		let newSendAmount = '';
		try {
			if (isEthereumChain(chain) && selectedToken && selectedToken.price !== undefined) {
				let maxAmount = selectedToken.amount;
				if (cleanEthereumAddress(selectedToken.address) === 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
					const chainId = getChainId(chain);
					const gasPrice = await getGasPrice(chainId);
					maxAmount = selectedToken.amount - 21000n * gasPrice;
				}
				if (sendAmountIsUSD) {
					newSendAmount = bigintToBigNumber(maxAmount, selectedToken.decimals).times(selectedToken.price).toString();
				} else {
					newSendAmount = tokenToString(maxAmount, selectedToken.decimals);
				}
			}
		} catch {
		} finally {
			this.setState({ sendAmount: newSendAmount });
		}
	};

	handleStartSend = async () => {
		const { askPasswordOnTransaction } = this.props;
		const { recipientAddress, sendAmount } = this.state;
		if (!recipientAddress) {
			messageToast('No recipient address');
		} else if (!new BigNumber(sendAmount).gt(0)) {
			messageToast('Invalid amount');
		} else if (askPasswordOnTransaction) {
			this.setState({ isAskingPassword: true });
		} else {
			await this.handleSend();
		}
	};

	handleCancelSend = () => {
		this.setState({ isAskingPassword: false });
	};

	handleSend = async () => {
		const { chain, securityToken } = this.props;
		const { recipientAddress, sendAmount, selectedToken, sendAmountIsUSD, address, privateKey } = this.state;
		try {
			this.setState({ isAskingPassword: false, isSending: true });
			if (
				isEthereumChain(chain) &&
				selectedToken &&
				selectedToken.price !== undefined &&
				recipientAddress &&
				new BigNumber(sendAmount).gt(0)
			) {
				if (cleanEthereumAddress(selectedToken.address) === 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
					const value = (
						sendAmountIsUSD ? new BigNumber(sendAmount).div(selectedToken.price) : new BigNumber(sendAmount)
					)
						.times(10 ** 18)
						.integerValue()
						.toString();
					const transactionReceipt = await sendBaseTransaction(
						chain,
						{ from: address, to: recipientAddress, value },
						securityToken,
						privateKey
					);
					if (!transactionReceipt) {
						throw new Error('No transaction receipt!');
					}
					const { transactionHash } = transactionReceipt;
					const heading = 'Transaction receipt!';
					const description = `Sent ${tokenToString(BigInt(value), selectedToken.decimals)} ${
						selectedToken.symbol
					} to ${recipientAddress}`;
					toast(
						<WsnToast
							chain={chain}
							heading={heading}
							message={description}
							url={getTransactionLink(chain, transactionHash)}
						/>
					);
					await addNotification({ heading, description, metadata: '' }, securityToken);
				} else {
					const value = addHexPrefix(
						(sendAmountIsUSD ? new BigNumber(sendAmount).div(selectedToken.price) : new BigNumber(sendAmount))
							.times(10 ** Number(selectedToken.decimals))
							.integerValue()
							.toString(16)
					);
					const web3 = new Web3(Web3.givenProvider);
					const erc20 = new web3.eth.Contract(erc20Abi as Array<AbiItem>);
					const data = erc20.methods.transfer(addHexPrefix(recipientAddress), value).encodeABI();
					const transactionReceipt = await sendBaseTransaction(
						chain,
						{ from: address, to: selectedToken.address, data },
						securityToken,
						privateKey
					);
					if (!transactionReceipt) {
						throw new Error('No transaction receipt!');
					}
					const { transactionHash } = transactionReceipt;
					const heading = 'Transaction receipt!';
					const description = `Sent ${tokenToString(BigInt(value), selectedToken.decimals)} ${
						selectedToken.symbol
					} to ${recipientAddress}`;
					toast(
						<WsnToast
							chain={chain}
							heading={heading}
							message={description}
							url={getTransactionLink(chain, transactionHash)}
						/>
					);
					await addNotification({ heading, description, metadata: '' }, securityToken);
				}
			} else if (isBitcoinChain(chain) && recipientAddress && new BigNumber(sendAmount).gt(0) && selectedToken) {
				const amount = bigNumberToBigint(new BigNumber(sendAmount), selectedToken.decimals);
				const transactionId = await sendTransaction(address, recipientAddress, amount, securityToken, privateKey);
				const heading = 'Transaction receipt!';
				const description = `Sent ${tokenToString(amount, selectedToken.decimals)} ${
					selectedToken.symbol
				} to ${recipientAddress}`;
				toast(
					<WsnToast
						chain={chain}
						heading={heading}
						message={description}
						url={getTransactionLink(chain, transactionId)}
					/>
				);
				await addNotification({ heading, description, metadata: '' }, securityToken);
			}
		} catch (e) {
			toast(<WsnToast chain={chain} heading="Error!" message={errorToString(e)} />);
		} finally {
			this.setState({ isSending: false });
		}
	};

	render() {
		const { currentTab, hiddenTokens, showTokenSelector, onCloseTokenSelector } = this.props;
		const {
			searchText,
			recipientAddress,
			filteredTokens,
			selectedToken,
			filteredTransactions,
			selectedTransaction,
			transactionInfo,
			sendFee,
			isAskingPassword,
			isSending,
			sendAmount,
			sendAmountIsUSD,
			totalAmountInUSD,
			address,
		} = this.state;

		return (
			<CoinsView
				isLoading={false}
				totalBalance={totalAmountInUSD}
				searchText={searchText}
				onChangeSearchText={this.handleChangeSearchText}
				tokens={filteredTokens}
				selectedToken={selectedToken}
				onSelectToken={this.handleSelectToken}
				hiddenTokens={hiddenTokens}
				showTokenSelector={showTokenSelector}
				onCloseTokenSelector={onCloseTokenSelector}
				onAddHiddenToken={this.handleAddHiddenToken}
				onDeleteHiddenToken={this.handleDeleteHiddenToken}
				currentTab={currentTab}
				transactions={filteredTransactions}
				selectedTransaction={selectedTransaction}
				onSelectTransaction={this.handleSelectTransaction}
				transactionInfo={transactionInfo}
				onMax={this.handleMax}
				sendAmountIsUSD={sendAmountIsUSD}
				onChangeSendAmountIsUSD={this.handleChangeSendAmountIsUSD}
				recipientAddress={recipientAddress}
				onChangeRecipientAddress={this.handleChangeRecipientAddress}
				sendAmount={sendAmount}
				onChangeSendAmount={this.handleChangeSendAmount}
				sendFee={sendFee}
				isAskingPassword={isAskingPassword}
				isSending={isSending}
				onStartSend={this.handleStartSend}
				onCancelSend={this.handleCancelSend}
				onSend={this.handleSend}
				walletAddress={address ?? ''}
			/>
		);
	}
}

const mapStateToProps = ({
	network: { chain },
	user: {
		mnemonic,
		securityToken,
		settings: { askPasswordOnTransaction },
	},
	wallet: { tokens, transactions, hiddenTokens },
}: IRootState) => ({
	chain,
	mnemonic,
	securityToken,
	tokens,
	hiddenTokens,
	transactions,
	askPasswordOnTransaction,
});

const mapDispatchToProps = (dispatch: IDispatch) => ({
	updateTokens: (tokens: Array<IToken>) => dispatch(updateTokens(tokens)),
	updateTransactions: (transactions: Array<ITransaction>) => dispatch(updateTransactions(transactions)),
});

const coins = connect(mapStateToProps, mapDispatchToProps)(Coins);

export { coins as Coins };
