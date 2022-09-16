import clsx from 'clsx';
import { DashboardLayout } from 'components/dashboardLayout/dashboardLayout';
import { Icon } from 'components/icon/icon';
import { ThemeIcon } from 'components/themeIcon/themeIcon';
import TxnList from 'components/txnList/txnList';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import { IToken, ITransaction } from 'types';
import { currencyFmt } from 'utils/currencyFmt';
import { tokenToString } from 'utils/utils';

interface ICoinViewProps {
	token: IToken;
	transactions: Array<ITransaction>;
	walletAddress: string;
	onGoToSend: () => void;
	onGoToReceive: () => void;
	onGoBack: () => void;
	onClickTransaction: (transaction: ITransaction) => void;
}

export const CoinView: FC<ICoinViewProps> = ({
	token,
	transactions,
	walletAddress,
	onGoBack,
	onGoToReceive,
	onGoToSend,
	onClickTransaction,
}) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);
	return (
		<DashboardLayout withNav={false} className={clsx('Coin', isDarkTheme && 'Coin--dark')}>
			<header className="Coin__header">
				<div className="Coin__header-left">
					<Icon className="Coin__header-left-back" name="chevron-left" onClick={onGoBack} />
					<span className="Coin__header-left-name">{token.name}</span>
					<img src={token.logoUri} alt={token.name} className="Coin__header-left-image" />
				</div>
				<div className="Coin__header-right">
					<ThemeIcon className="Coin__header-right-icon" name="upload" onClick={onGoToSend} />
					<ThemeIcon className="Coin__header-right-icon" name="download" onClick={onGoToReceive} />
				</div>
			</header>
			<div className="Coin__details">
				<h2 className="Coin__details-value">
					{tokenToString(token.amount, token.decimals)} {token.symbol}
				</h2>
				<small className="Coin__details-invested">{currencyFmt(token.amountInUSD)}</small>
			</div>
			<TxnList
				className="Coin__txns"
				transactions={transactions}
				selectedToken={token}
				walletAddress={walletAddress}
				onTxnClick={onClickTransaction}
			/>
		</DashboardLayout>
	);
};
