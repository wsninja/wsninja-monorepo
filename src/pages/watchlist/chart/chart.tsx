import clsx from 'clsx';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import TradingViewWidget from 'react-tradingview-widget';
import { IConversion } from 'store/conversions/conversions';
import { IRootState } from 'store/store';
import { currencyFmt } from 'utils/currencyFmt';
import './Chart.scss';

interface IChartProps {
	conversion: IConversion;
}

export const Chart: FC<IChartProps> = ({ conversion }) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	return (
		<div className={clsx('Chart', isDarkTheme && 'Chart--dark')}>
			<div className="Chart__header">
				<div className="Chart__header-left">
					<h2 className="Chart__header-heading">
						{conversion.from.unit}/{conversion.to.unit}
					</h2>
					<div className="Chart__header-prices">
						Last Price: {currencyFmt(conversion.from.price ?? NaN)} Low:{' '}
						{currencyFmt(conversion.from.priceLow24h ?? NaN)} High: {currencyFmt(conversion.from.priceHigh24h ?? NaN)}
					</div>
				</div>
				<div className="Chart__header-right"></div>
			</div>
			<div className="Chart__chart">
				<TradingViewWidget
					symbol={conversion.from.unit + conversion.to.unit}
					theme={isDarkTheme ? 'DARK' : 'LIGHT'}
					locale="en"
					height="400"
					autosize
					hide_side_toolbar={false}
				/>
			</div>
		</div>
	);
};
