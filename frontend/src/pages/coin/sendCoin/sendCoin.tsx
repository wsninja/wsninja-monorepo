import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Row } from 'components/flex/row';
import { Button } from 'components/form/button/button';
import { InputGroup } from 'components/form/inputGroup/inputGroup';
import { Icon } from 'components/icon/icon';
import { messageToast } from 'components/utils';
import { WsnToast } from 'components/wsnToast/wsnToast';
import erc20Abi from 'constants/erc20.json';
import { addHexPrefix } from 'ethereumjs-util';
import { PasswordModal } from 'modals/passwordModal/passwordModal';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { IRootState } from 'store/store';
import { IToken } from 'types';
import { getGasPrice } from 'utils/api/api';
import { sendTransaction } from 'utils/bitcoin';
import { getBitcoinKeys, getEthereumKeys } from 'utils/crypto';
import { currencyFmt } from 'utils/currencyFmt';
import { sendBaseTransaction } from 'utils/ethereum';
import { addNotification } from 'utils/notification';
import {
	bigintToBigNumber,
	bigNumberToBigint,
	cleanEthereumAddress,
	errorToString,
	getChainId,
	getTransactionLink,
	isBitcoinChain,
	isEthereumChain,
	tokenToString,
} from 'utils/utils';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import './SendCoin.scss';

interface ISendCoinProps {
	token: IToken;
	onBackClick: () => void;
}

export const SendCoin: FC<ISendCoinProps> = ({ token, onBackClick }) => {
	const {
		mnemonic,
		securityToken,
		settings: { askPasswordOnTransaction },
	} = useSelector((state: IRootState) => state.user);
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { chain } = useSelector((state: IRootState) => state.network);
	const [recipientAddress, setRecipientAddress] = useState('');
	const [sendAmount, setSendAmount] = useState<string>('');
	const [sendAmountIsUSD, setSendAmountIsUSD] = useState(false);
	// const [transactionFlag, setTransactionFlag] = useState(false);
	const [isAskingPassword, setIsAskingPassword] = useState(false);
	const [isSending, setIsSending] = useState(false);

	const { address, privateKey } = useMemo(() => {
		if (isEthereumChain(chain)) {
			return getEthereumKeys(mnemonic);
		} else if (isBitcoinChain(chain)) {
			return getBitcoinKeys(mnemonic);
		}
		return { address: '', privateKey: '' };
	}, [mnemonic, chain]);

	const conversion = useMemo((): string => {
		if (!token || token.price === undefined) {
			return '';
		}
		if (sendAmountIsUSD) {
			return `~${tokenToString(
				bigNumberToBigint(new BigNumber(sendAmount).div(token.price), token.decimals),
				token.decimals
			)} ${token.symbol}`;
		} else {
			return `~${currencyFmt(new BigNumber(sendAmount).times(token.price).toNumber())} USD`;
		}
	}, [token, sendAmountIsUSD, sendAmount]);

	const sendUnit = useMemo((): string => {
		if (token === undefined) {
			return '';
		}
		return sendAmountIsUSD ? 'USD' : token.symbol;
	}, [token, sendAmountIsUSD]);

	const handlePaste = useCallback(async () => {
		try {
			const clipboardText = await navigator.clipboard.readText();
			setRecipientAddress(clipboardText);
		} catch {}
	}, []);

	const handleMax = useCallback(async () => {
		let newSendAmount = '';
		try {
			if (isEthereumChain(chain) && token.price !== undefined) {
				let maxAmount = token.amount;
				if (cleanEthereumAddress(token.address) === 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
					const chainId = getChainId(chain);
					const gasPrice = await getGasPrice(chainId);
					maxAmount = token.amount - 21000n * gasPrice;
				}
				if (sendAmountIsUSD) {
					newSendAmount = bigintToBigNumber(maxAmount, token.decimals).times(token.price).toString();
				} else {
					newSendAmount = tokenToString(maxAmount, token.decimals);
				}
			}
		} catch {
		} finally {
			setSendAmount(newSendAmount);
		}
	}, [chain, sendAmountIsUSD, token.address, token.amount, token.decimals, token.price]);

	const handleSend = useCallback(async () => {
		try {
			setIsSending(true);
			setIsAskingPassword(false);
			if (
				isEthereumChain(chain) &&
				token.price !== undefined &&
				address &&
				securityToken &&
				privateKey &&
				recipientAddress &&
				new BigNumber(sendAmount).gt(0)
			) {
				if (cleanEthereumAddress(token.address) === 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
					const value = (sendAmountIsUSD ? new BigNumber(sendAmount).div(token.price) : new BigNumber(sendAmount))
						.times(10 ** 18)
						.integerValue()
						.toString();
					const { transactionHash } = await sendBaseTransaction(
						chain,
						{ from: address, to: recipientAddress, value },
						securityToken,
						privateKey
					);
					const heading = 'Transaction receipt!';
					const description = `Sent ${tokenToString(BigInt(value), token.decimals)} ${
						token.symbol
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
						(sendAmountIsUSD ? new BigNumber(sendAmount).div(token.price) : new BigNumber(sendAmount))
							.times(10 ** Number(token.decimals))
							.integerValue()
							.toString(16)
					);
					const web3 = new Web3(Web3.givenProvider);
					const erc20 = new web3.eth.Contract(erc20Abi as Array<AbiItem>);
					const data = erc20.methods.transfer(addHexPrefix(recipientAddress), value).encodeABI();
					const { transactionHash } = await sendBaseTransaction(
						chain,
						{ from: address, to: token.address, data },
						securityToken,
						privateKey
					);
					const heading = 'Transaction receipt!';
					const description = `Sent ${tokenToString(BigInt(value), token.decimals)} ${
						token.symbol
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
			} else if (isBitcoinChain(chain) && recipientAddress && new BigNumber(sendAmount).gt(0)) {
				const amount = bigNumberToBigint(new BigNumber(sendAmount), token.decimals);
				const transactionId = await sendTransaction(address, recipientAddress, amount, securityToken, privateKey);
				const heading = 'Transaction receipt!';
				const description = `Sent ${tokenToString(amount, token.decimals)} ${token.symbol} to ${recipientAddress}`;
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
			toast(<WsnToast chain={chain} heading={'Error!'} message={errorToString(e)} />);
		} finally {
			setIsSending(false);
		}
	}, [
		address,
		chain,
		privateKey,
		recipientAddress,
		securityToken,
		sendAmount,
		sendAmountIsUSD,
		token.address,
		token.decimals,
		token.price,
		token.symbol,
	]);

	const handleStartSend = useCallback(async () => {
		if (!recipientAddress) {
			messageToast('No recipient address');
		} else if (!new BigNumber(sendAmount).gt(0)) {
			messageToast('Invalid amount');
		} else if (askPasswordOnTransaction) {
			setIsAskingPassword(true);
		} else {
			await handleSend();
		}
	}, [askPasswordOnTransaction, handleSend, recipientAddress, sendAmount]);

	const handleCancelSend = useCallback(() => {
		setIsAskingPassword(false);
	}, []);

	return (
		<DashboardLayout withNav={false} className={clsx('SendCoin', isDarkTheme && 'SendCoin--dark')}>
			<header className="SendCoin__header">
				<Icon className="SendCoin__header-back" name="chevron-left" onClick={onBackClick} />
				Send {token.symbol}
			</header>
			<InputGroup
				id="recipient"
				className="SendCoin__recipient"
				label="Recipient Address"
				placeholder="Add here"
				value={recipientAddress}
				onChange={(e) => setRecipientAddress(e.target.value)}
				right={
					<span className="SendCoin__recipient-paste" onClick={handlePaste}>
						Paste
					</span>
				}
			/>
			<InputGroup
				id="amount"
				className="SendCoin__amount"
				label={`Amount ${sendUnit}`}
				placeholder="Add here"
				value={sendAmount}
				onChange={(e) => setSendAmount(e.target.value)}
				right={
					<Row gap="m">
						<span onClick={handleMax} className="DesktopCoins__send-amount-unit">
							MAX
						</span>
						<span onClick={() => setSendAmountIsUSD(!sendAmountIsUSD)} className="SendCoin__amount-unit">
							{sendUnit}
						</span>
					</Row>
				}
			/>
			<div className="SendCoin__conversion">{conversion}</div>
			<Button
				className="SendCoin__cta"
				variant="solid"
				color="primary"
				onClick={handleStartSend}
				isDarkTheme={isDarkTheme}
				loading={isSending}
			>
				Send
			</Button>
			{isAskingPassword && <PasswordModal onClose={handleCancelSend} onConfirm={handleSend} />}
		</DashboardLayout>
	);
};
