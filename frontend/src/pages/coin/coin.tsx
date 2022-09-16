import { Loader } from 'components/loader/loader';
import { bitcoinTokenHash } from 'constants/constants';
import { CoinView } from 'pages/coin/coinView';
import { ReceiveCoin } from 'pages/coin/receiveCoin/receiveCoin';
import { SendCoin } from 'pages/coin/sendCoin/sendCoin';
import { Transaction } from 'pages/coin/transaction/transaction';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IDispatch, IRootState } from 'store/store';
import { updateTokens, updateTransactions } from 'store/wallet/actions';
import { IChain, IToken, ITransaction } from 'types';
import { getTokenPrice, getTransactions, getWalletTokens } from 'utils/api/api';
import { getBalance, getTransactions as blockcyphter_getTransactions } from 'utils/blockcypher';
import { getBitcoinKeys, getEthereumKeys } from 'utils/crypto';
import { bigintToBigNumber, getChainId, isBitcoinChain, isEthereumChain } from 'utils/utils';
import './Coin.scss';

interface ICoinProps extends RouteComponentProps<{ tokenHash: string; transactionHash?: string }> {
	tokens: Array<IToken>;
	transactions: Array<ITransaction>;
	mnemonic: string;
	securityToken: string;
	chain: IChain;
	updateTokens: (tokens: Array<IToken>) => void;
	updateTransactions: (transactions: Array<ITransaction>) => void;
}

interface ICoinState {
	isLoading: boolean;
	showSend: boolean;
	showReceive: boolean;
	token: IToken | undefined;
	selectedTransaction: ITransaction | undefined;
	address: string;
}

class Coin extends Component<ICoinProps, ICoinState> {
	constructor(props: ICoinProps) {
		super(props);
		const { tokens, transactions, mnemonic, chain } = props;
		const { tokenHash, transactionHash } = props.match.params;
		const token = tokens.find((token) => token.tokenHash === tokenHash);
		const selectedTransaction = transactions.find(
			(transaction) => transaction.transactionHash.toLowerCase() === transactionHash?.toLowerCase()
		);
		const { address } = isEthereumChain(chain) ? getEthereumKeys(mnemonic) : getBitcoinKeys(mnemonic);
		this.state = {
			isLoading: true,
			showReceive: false,
			showSend: false,
			token,
			selectedTransaction,
			address,
		};
	}

	async componentDidMount() {
		try {
			this.updateTokens();
			this.updateTransactions();
		} finally {
			this.setState({ isLoading: false });
		}
	}

	async componentDidUpdate(prevProps: ICoinProps, prevState: ICoinState) {
		const { tokens, transactions, chain, mnemonic } = this.props;
		if (prevProps.chain !== chain) {
			this.updateTokens();
		}
		if (prevProps.chain !== chain) {
			this.updateTransactions();
		}
		if (prevProps.tokens !== tokens) {
			this.updateToken();
		}
		if (prevProps.transactions !== transactions) {
			this.updateSelectedTransaction();
		}
		if (prevProps.mnemonic !== mnemonic || prevProps.chain !== chain) {
			this.updateAddress();
		}
	}

	updateTokens = async () => {
		const { chain, securityToken } = this.props;
		const { address } = this.state;
		if (isEthereumChain(chain)) {
			const chainId = getChainId(chain);
			const tokens = await getWalletTokens({ chainId }, securityToken);
			this.props.updateTokens(tokens);
		} else if (isBitcoinChain(chain)) {
			const decimals = 8n;
			const amount = await getBalance(address);
			const { tokenPrice } = await getTokenPrice({ tokenSymbol: 'BTC' }, securityToken);
			const price = tokenPrice?.price;
			const amountInUSD = price === undefined ? 0 : bigintToBigNumber(amount, decimals).times(price).toNumber();
			this.props.updateTokens([
				{
					chain: 'bitcoin',
					tokenHash: bitcoinTokenHash,
					address: '',
					name: 'Bitcoin',
					symbol: 'BTC',
					logoUri: '',
					price,
					decimals,
					amount,
					amountInUSD,
					priceChangePercentage24h: tokenPrice?.priceChangePercentage24h ?? undefined,
				},
			]);
		} else {
			this.props.updateTokens([]);
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

	updateToken = () => {
		const { tokens } = this.props;
		const { tokenHash } = this.props.match.params;
		const token = tokens.find((token) => token.tokenHash === tokenHash);
		this.setState({ token });
	};

	updateSelectedTransaction = () => {
		const { transactions } = this.props;
		const { transactionHash } = this.props.match.params;
		const selectedTransaction = transactions.find(
			(transaction) => transaction.transactionHash.toLowerCase() === transactionHash?.toLowerCase()
		);
		this.setState({ selectedTransaction });
	};

	updateAddress = () => {
		const { mnemonic, chain } = this.props;
		if (isEthereumChain(chain)) {
			const { address } = getEthereumKeys(mnemonic);
			this.setState({ address });
		} else if (isBitcoinChain(chain)) {
			const { address } = getBitcoinKeys(mnemonic);
			this.setState({ address });
		} else {
			this.setState({ address: '' });
		}
	};

	handleGoToReceive = () => {
		this.setState({ showReceive: true });
	};

	handleGoToSend = () => {
		this.setState({ showSend: true });
	};

	handleResetShow = () => {
		this.setState({ showReceive: false, showSend: false });
	};

	handleGoBack = () => {
		const { history } = this.props;
		history.push(`/wallet/coins`);
	};

	handleClickTransaction = (transaction: ITransaction) => {
		const { history, transactions } = this.props;
		const { tokenHash } = this.props.match.params;
		const selectedTransaction = transactions.find(
			({ transactionHash }) => transactionHash === transaction.transactionHash
		);
		this.setState({ selectedTransaction });
		history.push(`/coin/${tokenHash}/${transaction.transactionHash}`);
	};

	render() {
		const { transactions } = this.props;
		const { transactionHash } = this.props.match.params;
		const { isLoading, showReceive, showSend, token, selectedTransaction, address } = this.state;
		if (isLoading || !token) {
			return <Loader />;
		}
		if (transactionHash && selectedTransaction) {
			return <Transaction transaction={selectedTransaction} token={token} walletAddress={address} />;
		}
		if (showSend) {
			return <SendCoin onBackClick={this.handleResetShow} token={token} />;
		}
		if (showReceive) {
			return <ReceiveCoin onBackClick={this.handleResetShow} unit={token.symbol} />;
		}
		return (
			<CoinView
				token={token}
				transactions={transactions}
				walletAddress={address}
				onGoBack={this.handleGoBack}
				onGoToReceive={this.handleGoToReceive}
				onGoToSend={this.handleGoToSend}
				onClickTransaction={this.handleClickTransaction}
			/>
		);
	}
}

const mapStateToProps = ({
	wallet: { tokens, transactions },
	user: { mnemonic, securityToken },
	network: { chain },
}: IRootState) => ({
	tokens,
	transactions,
	mnemonic,
	securityToken,
	chain,
});

const mapDispatchToProps = (dispatch: IDispatch) => ({
	updateTokens: (tokens: Array<IToken>) => dispatch(updateTokens(tokens)),
	updateTransactions: (transactions: Array<ITransaction>) => dispatch(updateTransactions(transactions)),
});

const coin = connect(mapStateToProps, mapDispatchToProps)(withRouter(Coin));

export { coin as Coin };
