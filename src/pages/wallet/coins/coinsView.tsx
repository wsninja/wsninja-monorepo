import DollarImg from 'assets/images/dollar.svg';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Col } from 'components/flex/col';
import { Row } from 'components/flex/row';
import { Button } from 'components/form/button/button';
import { Input } from 'components/form/input/input';
import { InputGroup } from 'components/form/inputGroup/inputGroup';
import { Switch } from 'components/form/swtich/switch';
import { Icon } from 'components/icon/icon';
import { Loader } from 'components/loader/loader';
import { Qr } from 'components/qr/qr';
import { Text } from 'components/text/text';
import { ThemeIcon } from 'components/themeIcon/themeIcon';
import TxnList from 'components/txnList/txnList';
import { renderTransactionAmount, toNiceAddress } from 'components/utils';
import copy from 'copy-to-clipboard';
import { uniqueId } from 'lodash';
import { PasswordModal } from 'modals/passwordModal/passwordModal';
import { SearchInput } from 'pages/wallet/coins/components/searchInput/searchInput';
import { ICoinTab } from 'pages/wallet/types';
import { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from 'store/store';
import styled, { useTheme } from 'styled-components';
import { IToken, ITransaction, ITransactionInfo } from 'types';
import { currencyFmt } from 'utils/currencyFmt';
import { useDevice } from 'utils/useDevice';
import {
	bigintToBigNumber,
	bigNumberToBigint,
	cleanEthereumAddress,
	getChain,
	getChainId,
	isTransactionPositive,
	tokenToString,
	useBrowser,
} from 'utils/utils';

const Highlight = styled.span`
	color: ${({ theme }) => theme.color.red};
	font-weight: 600;
`;

const TokenSelectorCard = styled(Row)`
	box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.15);
	border-radius: 5px;
	min-height: 48px;
`;

const TokenSelectorContainer = styled(Col)`
	max-height: calc(100vh - 160px - 25px - 160px);
	overflow-y: auto;
	box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
`;

const MobileSearchInput = styled(Input)`
	background-color: transparent;
	border: none;
	width: 100%;
`;

interface ICoinsViewProps {
	isLoading: boolean;
	totalBalance: number;
	searchText: string;
	onChangeSearchText: (searchText: string) => void;
	tokens: Array<IToken>;
	selectedToken: IToken | undefined;
	onSelectToken: (token: IToken) => void;
	hiddenTokens: Array<{ chainId: bigint; address: string }>;
	showTokenSelector: boolean;
	onCloseTokenSelector: () => void;
	onAddHiddenToken: (chainId: bigint, address: string) => void;
	onDeleteHiddenToken: (chainId: bigint, address: string) => void;
	currentTab: ICoinTab;
	transactions: Array<ITransaction>;
	selectedTransaction: ITransaction | undefined;
	onSelectTransaction: (transaction: ITransaction) => void;
	transactionInfo: ITransactionInfo | undefined;
	recipientAddress: string;
	onChangeRecipientAddress: (recipientAddress: string) => void;
	sendAmount: string;
	onChangeSendAmount: (sendAmount: string) => void;
	onMax: () => void;
	sendAmountIsUSD: boolean;
	onChangeSendAmountIsUSD: (sendAmountISUSD: boolean) => void;
	sendFee: number;
	isAskingPassword: boolean;
	isSending: boolean;
	onStartSend: () => void;
	onCancelSend: () => void;
	onSend: () => void;
	walletAddress: string;
}

export const CoinsView: FC<ICoinsViewProps> = ({
	isLoading,
	totalBalance,
	searchText,
	tokens,
	selectedToken,
	onSelectToken,
	hiddenTokens,
	showTokenSelector,
	onCloseTokenSelector,
	onAddHiddenToken,
	onDeleteHiddenToken,
	currentTab,
	transactions,
	selectedTransaction,
	onSelectTransaction,
	transactionInfo,
	recipientAddress,
	onChangeSearchText,
	onChangeRecipientAddress,
	sendAmount,
	onChangeSendAmount,
	onMax,
	sendAmountIsUSD,
	onChangeSendAmountIsUSD,
	sendFee,
	isAskingPassword,
	isSending,
	onStartSend,
	onCancelSend,
	onSend,
	walletAddress,
}) => {
	const { isDesktop } = useDevice();
	const theme = useTheme();
	const history = useHistory();
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const browser = useBrowser();

	const filteredTokens = useMemo(
		() =>
			tokens.filter(
				(token) =>
					!hiddenTokens.find(
						({ chainId, address }) =>
							token.chain === getChain(chainId) && cleanEthereumAddress(token.address) === cleanEthereumAddress(address)
					)
			),
		[tokens, hiddenTokens]
	);

	const handleChangeSearchText = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => onChangeSearchText(e.target.value),
		[onChangeSearchText]
	);

	const handlePaste = useCallback(async () => {
		try {
			const clipboardText = await navigator.clipboard.readText();
			onChangeRecipientAddress(clipboardText);
		} catch {}
	}, [onChangeRecipientAddress]);

	const conversion = useMemo((): string => {
		if (
			!selectedToken ||
			selectedToken.price === undefined ||
			!new BigNumber(sendAmount).isFinite() ||
			selectedToken.price === 0
		) {
			return '';
		}
		if (sendAmountIsUSD) {
			return `~${tokenToString(
				bigNumberToBigint(new BigNumber(sendAmount).div(selectedToken.price), selectedToken.decimals),
				selectedToken.decimals
			)} ${selectedToken.symbol}`;
		} else {
			return `~${currencyFmt(new BigNumber(sendAmount).times(selectedToken.price).toNumber())} USD`;
		}
	}, [selectedToken, sendAmountIsUSD, sendAmount]);

	const sendUnit = useMemo((): string => {
		if (selectedToken === undefined) {
			return '';
		}
		return sendAmountIsUSD ? 'USD' : selectedToken.symbol;
	}, [selectedToken, sendAmountIsUSD]);

	const renderPanelContent = useMemo(() => {
		if (!selectedToken) {
			return null;
		}
		switch (currentTab) {
			case 'History':
				return (
					<div className="DesktopCoins__history">
						<div className="DesktopCoins__history-list">
							<TxnList
								transactions={transactions}
								onTxnClick={(transaction) => onSelectTransaction(transaction)}
								selectedToken={selectedToken}
								walletAddress={walletAddress}
							/>
						</div>
						<div className="DesktopCoins__history-panel">
							<div className="DesktopCoins__history-panel-header">
								<img
									key={selectedToken.logoUri}
									className="DesktopCoins__history-panel-header-img"
									src={selectedToken.logoUri}
									alt={selectedToken.symbol}
									onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
								/>
								<h3 className="DesktopCoins__history-panel-header-name">{selectedToken.name}</h3>
							</div>
							<div className="DesktopCoins__history-panel-label">Wallet balance:</div>
							<div className="DesktopCoins__history-panel-balance">
								{tokenToString(selectedToken.amount, selectedToken.decimals)} {selectedToken.symbol}
							</div>
							<div className="DesktopCoins__history-panel-balance-usd">{currencyFmt(selectedToken.amountInUSD)}</div>
							<div className="DesktopCoins__history-panel-txn">
								{selectedTransaction && transactionInfo ? (
									<>
										<div
											className={clsx(
												'DesktopCoins__history-panel-txn-value',
												isTransactionPositive(walletAddress, selectedToken, selectedTransaction) &&
													'DesktopCoins__history-panel-txn-value--green'
											)}
										>
											{renderTransactionAmount(selectedTransaction, selectedToken, walletAddress)}
										</div>
										<div className="DesktopCoins__history-panel-card">
											<div className="DesktopCoins__history-panel-card-row">
												<h4 className="DesktopCoins__history-panel-card-row-key">Date</h4>
												<h4 className="DesktopCoins__history-panel-card-row-value">
													{selectedTransaction.date.toLocaleString()}
												</h4>
											</div>
											<div className="DesktopCoins__history-panel-card-row">
												<h4 className="DesktopCoins__history-panel-card-row-key">Status</h4>
												<h4 className="DesktopCoins__history-panel-card-row-value">
													{selectedTransaction.successful ? 'Completed' : 'Failed'}
												</h4>
											</div>

											<div className="DesktopCoins__history-panel-card-row">
												<h4 className="DesktopCoins__history-panel-card-row-key">Transaction Hash</h4>
												<h4 className="DesktopCoins__history-panel-card-row-value-multiline">
													{selectedTransaction.transactionHash}
												</h4>
											</div>

											<div className="DesktopCoins__history-panel-card-row">
												<h4 className="DesktopCoins__history-panel-card-row-key">Sender</h4>
												<h4 className="DesktopCoins__history-panel-card-row-value">
													{selectedTransaction.type === 'received' ||
													selectedTransaction.type === 'sent' ||
													selectedTransaction.type === 'called'
														? toNiceAddress(selectedTransaction.chain, selectedTransaction.fromAddress)
														: selectedTransaction.type === 'exchanged' && selectedTransaction.exchange
														? toNiceAddress(selectedTransaction.chain, selectedTransaction.exchange.srcAddress)
														: selectedTransaction.type === 'transfered' && selectedTransaction.transfer
														? toNiceAddress(selectedTransaction.chain, selectedTransaction.transfer.srcAddress)
														: 'NA'}
												</h4>
											</div>

											<div className="DesktopCoins__history-panel-card-row">
												<h4 className="DesktopCoins__history-panel-card-row-key">Recipient</h4>
												<h4 className="DesktopCoins__history-panel-card-row-value">
													{selectedTransaction.type === 'received' ||
													selectedTransaction.type === 'sent' ||
													selectedTransaction.type === 'called'
														? toNiceAddress(selectedTransaction.chain, selectedTransaction.toAddress)
														: selectedTransaction.type === 'exchanged' && selectedTransaction.exchange
														? toNiceAddress(selectedTransaction.chain, selectedTransaction.exchange.destAddress)
														: selectedTransaction.type === 'transfered' && selectedTransaction.transfer
														? toNiceAddress(selectedTransaction.chain, selectedTransaction.transfer.destAddress)
														: 'NA'}
												</h4>
											</div>
										</div>
										<div className="DesktopCoins__history-panel-card">
											<div className="DesktopCoins__history-panel-card-row">
												<h4 className="DesktopCoins__history-panel-card-row-key">Network Fee</h4>
												<h4 className="DesktopCoins__history-panel-card-row-value">
													{tokenToString(selectedTransaction.usedGas, selectedTransaction.decimals)}{' '}
													{selectedTransaction.valueUnit} ~
													{currencyFmt(
														bigintToBigNumber(selectedTransaction.usedGas, selectedTransaction.decimals)
															.times(transactionInfo.valuePriceInUSD)
															.toNumber()
													)}
												</h4>
											</div>
											{transactionInfo.chain !== 'bitcoin' && (
												<div className="DesktopCoins__history-panel-card-row">
													<h4 className="DesktopCoins__history-panel-card-row-key">Nonce</h4>
													<h4 className="DesktopCoins__history-panel-card-row-value">
														{transactionInfo.nonce.toString()}
													</h4>
												</div>
											)}
										</div>
									</>
								) : (
									<div className="DesktopCoins__history-panel-txn-empty">Select Transaction</div>
								)}
							</div>
						</div>
					</div>
				);
			case 'Send':
				return (
					<div className="DesktopCoins__send">
						<div className="DesktopCoins__send-left">
							<h3 className="DesktopCoins__send-header">Send {selectedToken.symbol}</h3>
							<InputGroup
								id="recipient"
								className="DesktopCoins__send-recipient"
								label="Recipient Address"
								placeholder="Add here"
								value={recipientAddress}
								onChange={(e) => onChangeRecipientAddress(e.target.value)}
								right={
									browser && browser.name !== 'firefox' ? (
										<span className="DesktopCoins__send-recipient-paste" onClick={handlePaste}>
											Paste
										</span>
									) : (
										''
									)
								}
							/>
							<InputGroup
								id="amount"
								className="DesktopCoins__send-amount"
								label={`Amount ${sendUnit}`}
								placeholder="Add here"
								value={sendAmount}
								onChange={(e) => onChangeSendAmount(e.target.value)}
								right={
									<Row gap="m">
										<span onClick={onMax} className="DesktopCoins__send-amount-unit">
											MAX
										</span>
										<span
											onClick={() => onChangeSendAmountIsUSD(!sendAmountIsUSD)}
											className="DesktopCoins__send-amount-unit"
										>
											{sendUnit}
										</span>
									</Row>
								}
							/>
							<div className="DesktopCoins__send-conversion">{conversion}</div>
							<div className="DesktopCoins__send-fee">
								Network Fee: <span>{currencyFmt(sendFee, true)}</span>
							</div>
							<div className="DesktopCoins__send-balance">
								Wallet Balance:{' '}
								<span>
									{tokenToString(selectedToken.amount, selectedToken.decimals)} {selectedToken.symbol}
								</span>
							</div>
							<Button
								className="DesktopCoins__send-cta"
								variant="solid"
								color="primary"
								size="lg"
								isDarkTheme={isDarkTheme}
								fullWidth
								onClick={onStartSend}
								loading={isSending}
							>
								Send
							</Button>
						</div>
						<div className="DesktopCoins__send-right">
							<img className="DesktopCoins__send-right-img" src={DollarImg} alt="Send Coin" />
							<div className="DesktopCoins__send-right-text">Instantly send your coins or token</div>
						</div>
					</div>
				);
			case 'Receive':
				return (
					<div className="DesktopCoins__receive">
						<h3 className="DesktopCoins__receive-header">Receive {selectedToken.symbol}</h3>
						<div className="DesktopCoins__receive-grid">
							<div className="DesktopCoins__receive-grid-left">
								<h4 className="DesktopCoins__receive-label">Wallet Balance:</h4>
								<h4 className="DesktopCoins__receive-balance">
									{tokenToString(selectedToken.amount, selectedToken.decimals)} {selectedToken.symbol}
								</h4>
								<h6 className="DesktopCoins__receive-balance-usd">{selectedToken.amountInUSD.toFixed(2)} USD</h6>
								<h4 className="DesktopCoins__receive-label">Wallet Address:</h4>
								<p className="DesktopCoins__receive-address">{walletAddress}</p>
								<ThemeIcon className="DesktopCoins__receive-copy" name="clone" onClick={() => copy(walletAddress)} />
							</div>
							<div className="DesktopCoins__receive-grid-right">
								<h3 className="DesktopCoins__receive-wsn">WallStreetNinja</h3>
								<Qr className="DesktopCoins__receive-qr" code={walletAddress} width={238} isDarkTheme={isDarkTheme} />
							</div>
							<p className="DesktopCoins__receive-disclaimer">
								Send only <Highlight>{selectedToken.symbol}</Highlight> to this address. <br />
								Sending any other coins may result in permanent loss
							</p>
						</div>
					</div>
				);
		}
	}, [
		sendAmount,
		conversion,
		currentTab,
		isDarkTheme,
		onChangeSendAmount,
		sendAmountIsUSD,
		onChangeSendAmountIsUSD,
		sendUnit,
		onChangeRecipientAddress,
		onSelectTransaction,
		recipientAddress,
		selectedToken,
		selectedTransaction,
		transactionInfo,
		isSending,
		transactions,
		walletAddress,
		sendFee,
		browser,
		handlePaste,
		onStartSend,
		onMax,
	]);

	const renderTokenSelector = useMemo(() => {
		return (
			<Col gap="l">
				<SearchInput value={searchText} onChange={handleChangeSearchText} placeholder="Search" />
				<TokenSelectorContainer gap="xxs">
					{tokens.map(({ chain, address, logoUri, symbol, name }) => {
						const isHidden = !!hiddenTokens.find(
							(hiddenToken) =>
								getChain(hiddenToken.chainId) === chain &&
								cleanEthereumAddress(hiddenToken.address) === cleanEthereumAddress(address)
						);

						if (chain === 'bitcoin') {
							return null;
						}

						return (
							<TokenSelectorCard
								key={address}
								backgroundColor="primaryBackground"
								alignItems="center"
								justifyContent="space-between"
								horizontalPadding="m"
							>
								<Row gap="m" alignItems="center">
									<img
										src={logoUri}
										alt={symbol}
										className="DesktopCoins__list-card-image"
										loading="lazy"
										onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
									/>
									<Text fontSize="m" fontWeight="bold">
										{name}
									</Text>
								</Row>
								<Switch
									name={uniqueId('Switch-')}
									checked={!isHidden}
									onChange={() =>
										isHidden
											? onDeleteHiddenToken(getChainId(chain), address)
											: onAddHiddenToken(getChainId(chain), address)
									}
									size="s"
								/>
							</TokenSelectorCard>
						);
					})}
				</TokenSelectorContainer>
			</Col>
		);
	}, [tokens, hiddenTokens, onAddHiddenToken, onDeleteHiddenToken, searchText, handleChangeSearchText]);

	if (isLoading) {
		return <Loader />;
	}
	if (isDesktop) {
		return (
			<>
				<div className={clsx('DesktopCoins', isDarkTheme && 'DesktopCoins--dark')}>
					<div className="DesktopCoins__left">
						{showTokenSelector ? (
							renderTokenSelector
						) : (
							<>
								<div className="DesktopCoins__left-header">{currencyFmt(totalBalance)}</div>
								<div className="DesktopCoins__list">
									{filteredTokens.map((token) => (
										<div className="DesktopCoins__list-card" key={token.address} onClick={() => onSelectToken(token)}>
											<img
												src={token.logoUri}
												alt={token.symbol}
												className="DesktopCoins__list-card-image"
												loading="lazy"
												onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
											/>
											<div className="DesktopCoins__list-card-content">
												<div className="DesktopCoins__list-card-content-top">
													<h3 className="DesktopCoins__list-card-content-top-name">{token.name}</h3>
													<h4 className="DesktopCoins__list-card-content-top-value">
														{tokenToString(token.amount, token.decimals)} {token.symbol}
													</h4>
												</div>
												<div className="DesktopCoins__list-card-content-bottom">
													<small className="DesktopCoins__list-card-content-bottom-amount">
														{currencyFmt(token.price ?? NaN)}{' '}
														<span
															className={clsx(
																'DesktopCoins__list-card-content-bottom-amount-change',
																token.priceChangePercentage24h === undefined ||
																	(token.priceChangePercentage24h < 0 &&
																		'DesktopCoins__list-card-content-bottom-amount-change--negative')
															)}
														>
															{token.priceChangePercentage24h === undefined
																? 'NA'
																: `${token.priceChangePercentage24h}%`}
														</span>
													</small>
													<small className="DesktopCoins__list-card-content-bottom-amount">
														{currencyFmt(token.amountInUSD)}
													</small>
												</div>
											</div>
										</div>
									))}
								</div>
							</>
						)}
					</div>
					<div className="DesktopCoins__right">{renderPanelContent}</div>
				</div>
				{isAskingPassword && <PasswordModal onClose={onCancelSend} onConfirm={onSend} />}
			</>
		);
	}

	if (showTokenSelector) {
		return (
			<DashboardLayout withNav={false}>
				<Col gap="m">
					<Row gap="m" alignItems="center">
						<Icon name="chevron-left" onClick={onCloseTokenSelector} color={theme.color.primary} />
						<MobileSearchInput value={searchText} onChange={handleChangeSearchText} placeholder="Search Tokens" />
					</Row>
					<TokenSelectorContainer gap="xxs">
						{tokens.map(({ chain, address, logoUri, symbol, name }) => {
							const isHidden = !!hiddenTokens.find(
								(hiddenToken) =>
									getChain(hiddenToken.chainId) === chain &&
									cleanEthereumAddress(hiddenToken.address) === cleanEthereumAddress(address)
							);

							if (chain === 'bitcoin') {
								return null;
							}

							return (
								<TokenSelectorCard
									key={address}
									backgroundColor="primaryBackground"
									alignItems="center"
									justifyContent="space-between"
									horizontalPadding="m"
								>
									<Row gap="m" alignItems="center">
										<img
											src={logoUri}
											alt={symbol}
											className="DesktopCoins__list-card-image"
											loading="lazy"
											onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
										/>
										<Text fontSize="m" fontWeight="bold">
											{name}
										</Text>
									</Row>
									<Switch
										name={uniqueId('Switch-')}
										checked={!isHidden}
										onChange={() =>
											isHidden
												? onDeleteHiddenToken(getChainId(chain), address)
												: onAddHiddenToken(getChainId(chain), address)
										}
										size="s"
									/>
								</TokenSelectorCard>
							);
						})}
					</TokenSelectorContainer>
				</Col>
			</DashboardLayout>
		);
	}

	return (
		<>
			<div className={clsx('Coins', isDarkTheme && 'Coins--dark')}>
				<h2 className="Coins__balance">{currencyFmt(totalBalance)}</h2>
				<Input value={searchText} onChange={handleChangeSearchText} placeholder="search" className="Coins__search" />
				<div className="Coins__list">
					{filteredTokens.map((token) => (
						<div
							className="Coins__list-card"
							key={token.tokenHash}
							onClick={() => history.push(`/coin/${token.tokenHash}`)}
						>
							<img
								src={token.logoUri}
								alt={token.symbol}
								className="Coins__list-card-image"
								loading="lazy"
								onLoad={(e) => (e.currentTarget.style.visibility = 'visible')}
							/>
							<div className="Coins__list-card-content">
								<div className="Coins__list-card-content-top">
									<h3 className="Coins__list-card-content-top-name">{token.name}</h3>
									<h4 className="Coins__list-card-content-top-value">
										{tokenToString(token.amount, token.decimals)} {token.symbol}
									</h4>
								</div>
								<div className="Coins__list-card-content-bottom">
									<small className="Coins__list-card-content-bottom-amount">
										{currencyFmt(bigintToBigNumber(token.amount, token.decimals).toNumber())}{' '}
										<span
											className={clsx(
												'Coins__list-card-content-bottom-amount-change',
												token.priceChangePercentage24h === undefined ||
													(token.priceChangePercentage24h < 0 &&
														'Coins__list-card-content-bottom-amount-change--negative')
											)}
										>
											{token.priceChangePercentage24h ?? 'NA'}
										</span>
									</small>
									<small className="Coins__list-card-content-bottom-amount">{currencyFmt(token.amountInUSD)}</small>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};
