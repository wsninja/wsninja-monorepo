import { IColor, IDistance, IFontSize, IFontWeight } from 'components/flex/types';
import { DefaultTheme } from 'styled-components';

export const toPx = (value: number): string => `${value}px`;

export const getColor = (theme: DefaultTheme, color: IColor | undefined): string | undefined => {
	switch (color) {
		case undefined:
			return undefined;
		case 'inherit':
			return 'inherit';
		case 'transparent':
			return 'transparent';
	}
	return theme.color[color];
};

export const getFontSize = (theme: DefaultTheme, fontSize: IFontSize | number): string => {
	if (typeof fontSize === 'number') {
		return toPx(fontSize);
	}
	return toPx(theme.fontSize[fontSize]);
};

export const getFontWeight = (theme: DefaultTheme, fontWeight: IFontWeight): string => {
	return theme.fontWeight[fontWeight];
};

export const getDistance = (theme: DefaultTheme, distance: IDistance | number): number => {
	if (typeof distance === 'number') {
		return distance;
	}
	// eslint-disable-next-line default-case
	switch (distance) {
		case 'none':
			return 0;
		default:
			return theme.distance[distance];
	}
};
