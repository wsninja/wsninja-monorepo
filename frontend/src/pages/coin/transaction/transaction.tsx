import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Icon } from 'components/icon/icon';
import { ThemeIcon } from 'components/themeIcon/themeIcon';
import { renderTransactionAmount, toNiceAddress } from 'components/utils';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { IRootState } from 'store/store';
import { IToken, ITransaction, ITransactionInfo } from 'types';
import { getTransactionInfo } from 'utils/api/api';
import { getHistoricValuePrice } from 'utils/api/wallet/wallet';
import { currencyFmt } from 'utils/currencyFmt';
import {
	bigintToBigNumber,
	getChainId,
	isBitcoinChain,
	isEthereumChain,
	isTransactionPositive,
	tokenToString,
} from 'utils/utils';
import './Transaction.scss';

interface ITransactionProps {
	transaction: ITransaction;
	token: IToken;
	walletAddress: string;
}

export const Transaction: FC<ITransactionProps> = ({ transaction, token, walletAddress }) => {
	const history = useHistory();
	const { tokenHash } = useParams<{ tokenHash: string }>();

	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	const { securityToken } = useSelector((state: IRootState) => state.user);

	const [transactionInfo, setTransactionInfo] = useState<ITransactionInfo | undefined>(undefined);

	useEffect(() => {
		if (securityToken) {
			if (isEthereumChain(transaction.chain)) {
				const chainId = getChainId(transaction.chain);
				getTransactionInfo(
					{ chainId: chainId, transactionHash: transaction.transactionHash, date: transaction.date },
					securityToken
				).then((transactionInfo) => {
					setTransactionInfo(transactionInfo);
				});
			} else if (isBitcoinChain(transaction.chain)) {
				getHistoricValuePrice({ chain: transaction.chain, date: transaction.date }, securityToken).then(
					({ valuePriceInUSD }) => {
						setTransactionInfo({
							chain: 'bitcoin',
							transactionHash: transaction.transactionHash,
							nonce: 0n,
							valuePriceInUSD,
						});
					}
				);
			} else {
				setTransactionInfo(undefined);
			}
		}
	}, [setTransactionInfo, securityToken, transaction]);

	if (!transactionInfo) {
		return null;
	}

	return (
		<DashboardLayout withNav={false} className={clsx('Transaction', isDarkTheme && 'Transaction--dark')}>
			<header className="Transaction__header">
				<Icon
					className="Transaction__header-back"
					name="chevron-left"
					onClick={() => history.push(`/coin/${tokenHash}`)}
				/>
				<h2
					className={clsx(
						'Transaction__header-value',
						isTransactionPositive(walletAddress, token, transaction)
							? 'Transaction__header-value--green'
							: 'Transaction__header-value--red'
					)}
				>
					{renderTransactionAmount(transaction, token, walletAddress)}
				</h2>
				<ThemeIcon className="Transaction__header-share" name="share" />
			</header>
			<div className="Transaction__card">
				<div className="Transaction__card-statement">
					<h3 className="Transaction__card-statement-desc">Date</h3>
					<h3 className="Transaction__card-statement-value">{transaction.date.toLocaleString()}</h3>
				</div>
				<div className="Transaction__card-statement">
					<h3 className="Transaction__card-statement-desc">Status</h3>
					<h3 className="Transaction__card-statement-value">{transaction.successful ? 'Completed' : 'Failed'}</h3>
				</div>
				<div className="Transaction__card-statement">
					<h3 className="Transaction__card-statement-desc">Sender</h3>
					<h3 className="Transaction__card-statement-value" title={transaction.fromAddress || transaction.toAddress}>
						{transaction.type === 'received' || transaction.type === 'sent' || transaction.type === 'called'
							? toNiceAddress(transaction.chain, transaction.fromAddress)
							: transaction.type === 'exchanged' && transaction.exchange
							? toNiceAddress(transaction.chain, transaction.exchange.srcAddress)
							: transaction.type === 'transfered' && transaction.transfer
							? toNiceAddress(transaction.chain, transaction.transfer.srcAddress)
							: 'NA'}
					</h3>
				</div>
				<div className="Transaction__card-statement">
					<h3 className="Transaction__card-statement-desc">Recipient</h3>
					<h3 className="Transaction__card-statement-value" title={transaction.fromAddress || transaction.toAddress}>
						{transaction.type === 'received' || transaction.type === 'sent' || transaction.type === 'called'
							? toNiceAddress(transaction.chain, transaction.toAddress)
							: transaction.type === 'exchanged' && transaction.exchange
							? toNiceAddress(transaction.chain, transaction.exchange.destAddress)
							: transaction.type === 'transfered' && transaction.transfer
							? toNiceAddress(transaction.chain, transaction.transfer.destAddress)
							: 'NA'}
					</h3>
				</div>
			</div>
			<div className="Transaction__card">
				<div className="Transaction__card-statement">
					<h3 className="Transaction__card-statement-desc">Network Fee {transactionInfo.valuePriceInUSD}</h3>
					<h3 className="Transaction__card-statement-value">
						{tokenToString(transaction.usedGas, transaction.decimals)} {transaction.valueUnit} ~
						{currencyFmt(
							bigintToBigNumber(transaction.usedGas, transaction.decimals)
								.times(transactionInfo.valuePriceInUSD)
								.toNumber()
						)}
					</h3>
				</div>
				{transaction.chain !== 'bitcoin' && (
					<div className="Transaction__card-statement">
						<h3 className="Transaction__card-statement-desc">Nonce</h3>
						<h3 className="Transaction__card-statement-value">{transactionInfo.nonce.toString()}</h3>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
};
