import { createSlice } from '@reduxjs/toolkit';
import { changeTheme } from 'utils/changeTheme';

export interface IThemeState {
	isDarkTheme: boolean;
}

export const initialThemeState: IThemeState = {
	isDarkTheme: false,
};

export const themeSlice = createSlice({
	name: 'theme',
	initialState: initialThemeState,
	reducers: {
		setDarkTheme: (state, action) => {
			state.isDarkTheme = action.payload;
			changeTheme(action.payload);
		},
		toggle: (state) => {
			state.isDarkTheme = !state.isDarkTheme;
			changeTheme(state.isDarkTheme);
		},
	},
});

export const { toggle, setDarkTheme } = themeSlice.actions;

export const themeReducer = themeSlice.reducer;
