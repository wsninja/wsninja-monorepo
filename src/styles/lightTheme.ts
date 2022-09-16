import { DefaultTheme } from 'styled-components';
import {
	black,
	charcoal,
	distance,
	fontSize,
	fontWeight,
	gray,
	lightGray,
	mobileThreshold,
	red,
	ultraGray,
	white,
} from 'styles/base';

export const lightTheme: DefaultTheme = {
	mode: 'light',
	isDark: false,
	isLight: true,
	color: {
		white,
		black,
		red,
		charcoal,
		gray,
		lightGray,
		ultraGray,
		primary: black,
		primaryBackground: white,
		primaryBrand: red,
		primaryText: gray,
	},
	fontSize,
	fontWeight,
	distance,
	mobileThreshold,
};
