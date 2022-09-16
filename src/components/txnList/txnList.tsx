import clsx from 'clsx';
import { Icon, IIcon } from 'components/icon/icon';
import { renderTransactionAmount } from 'components/utils';
import dayjs from 'dayjs';
import React, { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import { IToken, ITransaction, ITransactionType } from 'types';
import { groupTransactionsByDate } from 'utils/groupTransactionsByDate';
import './TxnList.scss';

interface ITxnListProps {
	className?: string;
	transactions: Array<ITransaction>;
	selectedToken: IToken;
	walletAddress: string;
	onTxnClick: (transaction: ITransaction) => void;
}

const TxnList: FC<ITxnListProps> = ({ className, transactions, selectedToken, walletAddress, onTxnClick }) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

	const getIconName = useCallback((txnType: ITransactionType) => {
		switch (txnType) {
			case 'received':
				return 'download';
			case 'sent':
				return 'upload';
			case 'exchanged':
			case 'transfered':
			case 'called':
				return 'bolt';
			default:
				return undefined;
		}
	}, []);

	const renderTransactionType = useCallback((transactionType: ITransactionType) => {
		switch (transactionType) {
			case 'received':
				return 'Received';
			case 'sent':
				return 'Sent';
			case 'exchanged':
				return 'Exchanged';
			case 'transfered':
				return 'Transfered';
			case 'called':
				return 'Smart Contract Call';
			default:
				return 'UNKNOWN';
		}
	}, []);

	return (
		<div className={clsx('TxnList', isDarkTheme && 'TxnList--dark', className)}>
			{Object.keys(groupedTransactions).length === 0 ? (
				<div className="TxnList__history-day-header">
					<small>History</small>
				</div>
			) : (
				Object.entries(groupedTransactions).map(([date, txns], index) => (
					<div className="TxnList__history-day" key={date}>
						<div className="TxnList__history-day-header">
							<small>{index === 0 && 'History'}</small>
							<small>{dayjs(date).format('MMM DD, YYYY')}</small>
						</div>
						<div className="TxnList__history-day-list">
							{txns.map((txn) => (
								<div
									key={txn.transactionHash}
									className="TxnList__history-day-list-card"
									role="button"
									tabIndex={0}
									onClick={() => onTxnClick(txn)}
								>
									<Icon className="TxnList__history-day-list-card-icon" name={getIconName(txn.type) as IIcon} />
									<div className="TxnList__history-day-list-card-content">
										<div className="TxnList__history-day-list-card-content-top">
											<h3>{renderTransactionType(txn.type)}</h3>
											<h3>{renderTransactionAmount(txn, selectedToken, walletAddress)}</h3>
										</div>
										<div className="TxnList__history-day-list-card-content-bottom">
											{txn.fromAddress ? 'From' : 'To'}: {txn.fromAddress || txn.toAddress}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default TxnList;
