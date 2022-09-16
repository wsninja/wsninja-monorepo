import 'styled-components';

declare module 'styled-components' {
	export interface DefaultTheme {
		mode: 'light' | 'dark';
		isDark: boolean;
		isLight: boolean;
		color: {
			white: string;
			black: string;
			red: string;
			charcoal: string;
			gray: string;
			lightGray: string;
			ultraGray: string;
			primary: string;
			primaryBackground: string;
			primaryBrand: string;
			primaryText: string;
		};
		fontSize: {
			xxs: number;
			xs: number;
			s: number;
			m: number;
			l: number;
			xl: number;
			xxl: number;
			'3xl': number;
			'4xl': number;
		};
		fontWeight: {
			normal: string;
			semibold: string;
			bold: string;
		};
		distance: {
			xxs;
			xs: number;
			s: number;
			m: number;
			l: number;
			xl: number;
			xxl: number;
			'3xl': number;
			'4xl': number;
			'5xl': number;
			'6xl': number;
			'7xl': number;
			'8xl': number;
		};
		mobileThreshold: number;
	}
}
