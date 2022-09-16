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

export const darkTheme: DefaultTheme = {
	mode: 'dark',
	isDark: true,
	isLight: false,
	color: {
		white,
		black,
		red,
		charcoal,
		gray,
		lightGray,
		ultraGray,
		primary: white,
		primaryBackground: black,
		primaryBrand: red,
		primaryText: white,
	},
	fontSize,
	fontWeight,
	distance,
	mobileThreshold,
};
