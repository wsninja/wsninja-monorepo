import { createSlice } from '@reduxjs/toolkit';
import { CoinList } from './CoinList';

export interface IConversion {
	from: {
		name: string;
		unit: string;
		change: number | null;
		price?: number;
		priceLow24h?: number;
		priceHigh24h?: number;
		image: string;
	};
	to: {
		name: string;
		unit: string;
		change: number;
		image: string;
	};
}

export interface IConversionsState {
	conversions: Array<IConversion>;
	watchlist: Array<IConversion>;
}

export const initialConversionsState: IConversionsState = {
	conversions: CoinList,
	watchlist: [],
};

export const conversionsSlice = createSlice({
	name: 'conversions',
	initialState: initialConversionsState,
	reducers: {
		addToWatchlist: (state, action) => {
			console.log(action.payload);
			state.watchlist = [...state.watchlist, action.payload];
		},
		removeFromWatchlist: (state, action) => {
			state.watchlist = state.watchlist.filter(
				(conv) =>
					!(
						conv.to.unit === action.payload.conversion.to.unit && conv.from.unit === action.payload.conversion.from.unit
					)
			);
		},
		updateConversionPrices: (state, action) => {
			state.conversions = action.payload;
		},
		updateWatchlist: (state, action) => {
			state.watchlist = action.payload;
		},
	},
});

export const { addToWatchlist, removeFromWatchlist, updateConversionPrices, updateWatchlist } =
	conversionsSlice.actions;

export default conversionsSlice.reducer;
