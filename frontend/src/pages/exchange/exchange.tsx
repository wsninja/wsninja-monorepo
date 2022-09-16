import BigNumber from 'bignumber.js';
import { messageToast } from 'components/utils';
import { WsnToast } from 'components/wsnToast/wsnToast';
import { addHexPrefix } from 'ethereumjs-util';
import { ExchangeView } from 'pages/exchange/exchangeView';
import { GAS_PRICE_OPTIONS, SLIPPAGE_OPTIONS } from 'pages/exchange/settings/settings';
import { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { IRootState } from 'store/store';
import { IChain, ICustomToken, ISwapToken } from 'types';
import {
	addCustomToken,
	getAllowanceTransaction,
	getCustomTokens,
	getGasPrice,
	getReferrerFee,
	getSwapTransaction,
} from 'utils/api/api';
import { getEthereumKeys } from 'utils/crypto';
import { sendTransaction } from 'utils/ethereum';
import { addNotification } from 'utils/notification';
import { getSwapQuote } from 'utils/oneInch';
import {
	bigintToBigNumber,
	bigNumberToBigint,
	cleanEthereumAddress,
	errorToString,
	getChainId,
	getTokenFilters,
	getTransactionLink,
	isEthereumChain,
	toHex,
} from 'utils/utils';

interface IExchangeProps {
	chain: IChain;
	chainCoinPrice: number | undefined;
	mnemonic: string;
	securityToken: string;
	tokens: Array<ISwapToken>;
	askPasswordOnTransaction: boolean;
}

interface IExchangeState {
	isLoading: boolean;
	srcToken: ISwapToken | undefined;
	destToken: ISwapToken | undefined;
	srcValue: string;
	destValue: string;
	destValueTimestamp: number;
	tokens: Array<ISwapToken>;
	customTokens: Array<ICustomToken>;
	referrerFee: number | undefined;
	isAskingPassword: boolean;
	isSwapping: boolean;
	refresh: number;

	allowPartialFill: boolean;
	slippageToleranceId: number;
	slippageTolerance: number;
	gasPrice: bigint;
	gasPricePercentageId: number;
	gasPricePercentage: bigint;
	transactionGasCost: number;
	transactionUsdCost: number;
}

class Exchange extends Component<IExchangeProps, IExchangeState> {
	constructor(props: IExchangeProps) {
		super(props);
		const { chain, tokens } = props;
		let filteredTokens = new Array<ISwapToken>();
		let srcToken: ISwapToken | undefined;
		let destToken: ISwapToken | undefined;
		if (isEthereumChain(chain)) {
			const chainId = getChainId(chain);

			const tokenFilters = getTokenFilters(chainId);
			filteredTokens = tokens
				.filter((token) => token.chainId === chainId)
				.filter((token) =>
					tokenFilters.find(
						(filter) =>
							token.chainId === filter.chainId &&
							cleanEthereumAddress(token.address) === cleanEthereumAddress(filter.address)
					)
				);
			if (filteredTokens.length >= 2) {
				if (!srcToken) {
					srcToken = filteredTokens[0];
				}
				if (!destToken) {
					destToken = filteredTokens[1];
				}
			}
		}
		this.state = {
			isLoading: false,
			srcToken,
			destToken,
			srcValue: '1',
			destValue: '',
			destValueTimestamp: 0,
			tokens: filteredTokens,
			referrerFee: undefined,
			isAskingPassword: false,
			isSwapping: false,
			refresh: Math.random(),
			allowPartialFill: true,
			slippageToleranceId: SLIPPAGE_OPTIONS[0].id,
			slippageTolerance: SLIPPAGE_OPTIONS[0].payload,
			gasPrice: 0n,
			gasPricePercentageId: GAS_PRICE_OPTIONS[0].id,
			gasPricePercentage: GAS_PRICE_OPTIONS[0].payload,
			transactionGasCost: 0,
			transactionUsdCost: 0,
			customTokens: [],
		};
	}

	async componentDidMount() {
		this.updateTokens();
		await this.updateCustomTokens();
		this.updateSelectedTokens();
		await this.updateReferrerFee();
		await this.updateDestValue();
		this.updateTransactionUsdCost();
	}

	async componentDidUpdate(prevProps: IExchangeProps, prevState: IExchangeState) {
		const { chain, tokens, chainCoinPrice } = this.props;
		const {
			tokens: stateTokens,
			srcToken,
			destToken,
			srcValue,
			gasPricePercentage,
			transactionGasCost,
			referrerFee,
			customTokens,
			refresh,
		} = this.state;
		if (
			prevProps.chain !== chain ||
			prevProps.tokens !== tokens ||
			prevState.customTokens !== customTokens ||
			prevState.refresh !== refresh
		) {
			this.updateTokens();
		}
		if (prevState.tokens !== stateTokens) {
			this.updateSelectedTokens();
		}
		if (
			prevState.srcValue !== srcValue ||
			prevState.srcToken !== srcToken ||
			prevState.destToken !== destToken ||
			prevState.gasPricePercentage !== gasPricePercentage ||
			prevState.referrerFee !== referrerFee ||
			prevState.refresh !== refresh
		) {
			await this.updateDestValue();
		}
		if (
			prevProps.chainCoinPrice !== chainCoinPrice ||
			prevState.transactionGasCost !== transactionGasCost ||
			prevState.refresh !== refresh
		) {
			this.updateTransactionUsdCost();
		}
	}

	updateTokens = () => {
		const { chain, tokens } = this.props;
		const { customTokens } = this.state;
		if (isEthereumChain(chain)) {
			const chainId = getChainId(chain);
			const tokenFilters = getTokenFilters(chainId);
			const filteredTokens = tokens
				.filter((token) => token.chainId === chainId)
				.filter(
					(token) =>
						tokenFilters.find(
							(filter) => cleanEthereumAddress(token.address) === cleanEthereumAddress(filter.address)
						) ||
						customTokens.find(
							(customToken) =>
								customToken.chainId === chainId &&
								cleanEthereumAddress(customToken.address) === cleanEthereumAddress(token.address)
						)
				);
			this.setState({ tokens: filteredTokens });
		} else {
			this.setState({ tokens: [] });
		}
	};

	updateCustomTokens = async () => {
		const { securityToken } = this.props;
		const { customTokens } = await getCustomTokens(securityToken);
		this.setState({ customTokens });
	};

	updateSelectedTokens = () => {
		const { chain } = this.props;
		const { tokens, srcToken, destToken } = this.state;
		if (tokens.length < 2) {
			this.setState({ srcToken: undefined, destToken: undefined });
			return;
		}
		if (srcToken && destToken && tokens[0].chainId === srcToken.chainId) {
			const newSrcToken = tokens.find((token) => token.address.toLowerCase() === srcToken.address.toLowerCase());
			const newDestToken = tokens.find((token) => token.address.toLowerCase() === destToken.address.toLowerCase());
			this.setState({ srcToken: newSrcToken, destToken: newDestToken });
			return;
		}
		let newSrcToken: ISwapToken | undefined;
		let newDestToken: ISwapToken | undefined;
		if (!newSrcToken) {
			newSrcToken = tokens[0];
		}
		if (!newDestToken) {
			newDestToken = tokens[1];
		}
		this.setState({ srcToken: newSrcToken, destToken: newDestToken });
	};

	updateReferrerFee = async () => {
		const referrerFee = await getReferrerFee();
		this.setState({ referrerFee });
	};

	updateDestValue = async () => {
		const { chain } = this.props;
		const { srcToken, destToken, srcValue, gasPricePercentage, referrerFee } = this.state;
		const timestamp = Date.now();
		let destValue = '';
		let transactionGasCost = 0;
		try {
			const parsedAmount = new BigNumber(srcValue);
			if (srcToken && destToken && parsedAmount.gt(0) && referrerFee !== undefined) {
				const chainId = getChainId(chain);
				const amount = BigInt(
					parsedAmount
						.times((10n ** srcToken.decimals).toString())
						.integerValue()
						.toFixed(0)
				);
				const { toTokenAmount, estimatedGas } = await getSwapQuote(
					chainId,
					srcToken.address,
					destToken.address,
					amount,
					referrerFee
				);
				destValue = bigintToBigNumber(BigInt(toTokenAmount), destToken.decimals).toString();
				if (gasPricePercentage !== undefined) {
					const gasPrice = await getGasPrice(chainId);
					transactionGasCost = bigintToBigNumber(
						(BigInt(estimatedGas) * gasPrice * gasPricePercentage) / 100n,
						18n
					).toNumber();
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			if (timestamp > this.state.destValueTimestamp) {
				this.setState({ destValue, destValueTimestamp: timestamp, transactionGasCost });
			}
		}
	};

	updateTransactionUsdCost = () => {
		const { chainCoinPrice } = this.props;
		const { transactionGasCost } = this.state;
		this.setState({ transactionUsdCost: (chainCoinPrice ?? 0) * transactionGasCost });
	};

	handleChangeSrcToken = (srcToken: ISwapToken) => {
		this.setState({ srcToken });
	};

	handleChangeDestToken = (destToken: ISwapToken) => {
		this.setState({ destToken });
	};

	handleChangeSrcValue = (srcValue: string) => {
		this.setState({ srcValue });
	};

	handleChangeAllowPartialFill = (allowPartialFill: boolean) => {
		this.setState({ allowPartialFill });
	};

	handleChangeSlippageTolerance = (slippageToleranceId: number, slippageTolerance: number) => {
		this.setState({ slippageToleranceId, slippageTolerance });
	};

	handleChangeGasPricePercentage = (gasPricePercentageId: number, gasPricePercentage: bigint) => {
		this.setState({ gasPricePercentageId, gasPricePercentage });
	};

	handleAddCustomToken = async (customTokenAddress: string) => {
		const { securityToken, chain, tokens } = this.props;
		if (!customTokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
			messageToast('Invalid address');
		} else {
			if (!tokens.find((token) => cleanEthereumAddress(token.address) === cleanEthereumAddress(customTokenAddress))) {
				messageToast('This token is not traded by 1Inch');
			}
			const chainId = getChainId(chain);
			try {
				await addCustomToken({ chainId, address: customTokenAddress }, securityToken);
			} catch (e) {
				if (errorToString(e).toLowerCase().includes('address is not for a contract')) {
					messageToast('This is not a contract address');
					return;
				}
				throw e;
			}
			await this.updateCustomTokens();
		}
	};

	handleSwapSrcDestToken = () => {
		const { srcToken, destToken } = this.state;
		this.setState({ srcToken: destToken, destToken: srcToken });
	};

	handleRefresh = () => {
		this.setState({ refresh: Math.random() });
	};

	handleStartSwap = async () => {
		const { askPasswordOnTransaction } = this.props;
		if (askPasswordOnTransaction) {
			this.setState({ isAskingPassword: true });
		} else {
			await this.handleSwap();
		}
	};

	handleCancelSwap = () => {
		this.setState({ isAskingPassword: false });
	};

	handleSwap = async () => {
		const { chain, securityToken, mnemonic } = this.props;
		const { srcToken, srcValue, destToken, gasPricePercentage, allowPartialFill, slippageTolerance } = this.state;
		if (srcToken && destToken) {
			try {
				const { privateKey, address } = getEthereumKeys(mnemonic);
				this.setState({ isAskingPassword: false, isSwapping: true });
				const chainId = getChainId(chain);
				const numberedSrcValue = new BigNumber(srcValue);
				if (numberedSrcValue.gt(0)) {
					const amount = bigNumberToBigint(numberedSrcValue, srcToken.decimals);
					const allowanceTransactionData = await getAllowanceTransaction(
						addHexPrefix(address),
						chainId,
						addHexPrefix(srcToken.address),
						amount
					);
					if (allowanceTransactionData) {
						allowanceTransactionData.gasPrice = toHex(
							(BigInt(allowanceTransactionData.gasPrice) * gasPricePercentage) / 100n
						);
						await sendTransaction(
							chain,
							{
								to: allowanceTransactionData.to,
								value: allowanceTransactionData.value,
								data: allowanceTransactionData.data,
								gasPrice: allowanceTransactionData.gasPrice,
								gasLimit: allowanceTransactionData.gas,
								nonce: allowanceTransactionData.nonce,
							},
							securityToken,
							privateKey
						);
					}
					const swapTransactionData = await getSwapTransaction(
						addHexPrefix(address),
						chainId,
						addHexPrefix(srcToken.address),
						addHexPrefix(destToken.address),
						amount,
						allowPartialFill,
						slippageTolerance
					);
					if (swapTransactionData) {
						if (allowanceTransactionData) {
							const prevNonce = BigInt(allowanceTransactionData.nonce);
							if (prevNonce === BigInt(swapTransactionData.nonce)) {
								swapTransactionData.nonce = Number(prevNonce + 1n);
							}
						}
						swapTransactionData.gasPrice = toHex((BigInt(swapTransactionData.gasPrice) * gasPricePercentage) / 100n);
						const { transactionHash } = await sendTransaction(
							chain,
							{
								to: swapTransactionData.to,
								value: swapTransactionData.value,
								data: swapTransactionData.data,
								gasPrice: swapTransactionData.gasPrice,
								gasLimit: swapTransactionData.gas,
								nonce: swapTransactionData.nonce,
							},
							securityToken,
							privateKey
						);
						const heading = 'Transaction receipt!';
						const description = `Swap ${srcToken.symbol} to ${destToken.symbol}`;
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
				}
			} catch (e) {
				console.error(e);
				const heading = 'Transaction Failed!';
				const description = `Swap ${srcToken.symbol} to ${destToken.symbol}`;
				toast(<WsnToast chain={chain} heading={heading} message={description} />);
				await addNotification({ heading, description, metadata: '' }, securityToken);
			} finally {
				this.setState({ isSwapping: false });
			}
		}
	};

	render() {
		const { chain } = this.props;
		const {
			srcToken,
			destToken,
			srcValue,
			destValue,
			tokens,
			allowPartialFill,
			slippageToleranceId,
			gasPricePercentageId,
			customTokens,
			transactionGasCost,
			transactionUsdCost,
			isAskingPassword,
			isSwapping,
		} = this.state;

		const isEthereum = isEthereumChain(chain);

		return (
			<ExchangeView
				isLoading={isEthereum && (tokens.length === 0 || !srcToken || !destToken)}
				isSwapSupported={isEthereum}
				srcToken={srcToken}
				onChangeSrcToken={this.handleChangeSrcToken}
				destToken={destToken}
				onChangeDestToken={this.handleChangeDestToken}
				srcValue={srcValue}
				onChangeSrcValue={this.handleChangeSrcValue}
				destValue={destValue}
				tokens={tokens}
				allowPartialFill={allowPartialFill}
				onChangeAllowPartialFill={this.handleChangeAllowPartialFill}
				slippageToleranceId={slippageToleranceId}
				onChangeSlippageTolerance={this.handleChangeSlippageTolerance}
				gasPricePercentageId={gasPricePercentageId}
				onChangeGasPricePercentage={this.handleChangeGasPricePercentage}
				customTokens={customTokens}
				onAddCustomToken={this.handleAddCustomToken}
				onSwapSrcDestToken={this.handleSwapSrcDestToken}
				onRefresh={this.handleRefresh}
				onStartSwap={this.handleStartSwap}
				onCancelSwap={this.handleCancelSwap}
				onSwap={this.handleSwap}
				isAskingPassword={isAskingPassword}
				isSwapping={isSwapping}
				transactionGasCost={transactionGasCost}
				transactionUsdCost={transactionUsdCost}
			/>
		);
	}
}

const mapStateToProps = ({
	network: { chain, chainCoinPrice },
	user: {
		mnemonic,
		securityToken,
		settings: { askPasswordOnTransaction },
	},
	swap: { tokens },
}: IRootState) => ({
	chain,
	chainCoinPrice,
	mnemonic,
	tokens,
	securityToken,
	askPasswordOnTransaction,
});

const exchange = connect(mapStateToProps)(Exchange);

export { exchange as Exchange };
