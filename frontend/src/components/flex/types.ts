export type IColor = 'inherit' | 'transparent' | 'primary' | 'primaryBrand' | 'primaryBackground' | 'primaryText';

export type IFontSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | '3xl' | '4xl';

export type IFontWeight = 'normal' | 'semibold' | 'bold';

export type IDistance =
	| 'none'
	| 'xxs'
	| 'xs'
	| 's'
	| 'm'
	| 'l'
	| 'xl'
	| 'xxl'
	| '3xl'
	| '4xl'
	| '5xl'
	| '6xl'
	| '7xl'
	| '8xl';

export type IFlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export type IJustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

export type IAlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

export type IAlignContent = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';

export type ITextAlign = 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';

export type IAlignSelf = 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

export interface IStyledProps {
	id?: string;
	className?: string;
}
