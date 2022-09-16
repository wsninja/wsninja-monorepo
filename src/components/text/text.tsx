import { IAlignSelf, IColor, IDistance, IFontSize, IFontWeight, IStyledProps, ITextAlign } from 'components/flex/types';
import { getColor, getDistance, getFontSize, getFontWeight, toPx } from 'components/flex/utils';
import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

const StyledText = styled.span<{
	fontSize: IFontSize | number;
	color: IColor;
	backgroundColor?: IColor;
	fontWeight: IFontWeight;
	mobileFontSize: IFontSize | number;
	textAlign?: ITextAlign;
	verticalMargin: IDistance | number;
	alignSelf: IAlignSelf;
}>`
	color: ${({ theme, color }) => getColor(theme, color)};
	background-color: ${({ theme, backgroundColor }) => getColor(theme, backgroundColor)};
	font-size: ${({ theme, fontSize }): string => getFontSize(theme, fontSize)};
	font-weight: ${({ theme, fontWeight }) => getFontWeight(theme, fontWeight)};
	text-align: ${({ textAlign }) => textAlign};
	margin-top: ${({ theme, verticalMargin }) => toPx(getDistance(theme, verticalMargin))};
	margin-bottom: ${({ theme, verticalMargin }) => toPx(getDistance(theme, verticalMargin))};
	align-self: ${({ alignSelf }) => alignSelf};
	line-height: 153.2%;

	@media (max-width: ${({ theme }) => toPx(theme.mobileThreshold)}) {
		font-size: ${({ theme, mobileFontSize }): string => getFontSize(theme, mobileFontSize)};
	}
`;

interface ITextProps extends IStyledProps {
	children?: ReactNode;
	fontSize: IFontSize | number;
	color?: IColor;
	backgroundColor?: IColor;
	fontWeight?: IFontWeight;
	mobileFontSize?: IFontSize | number;
	textAlign?: ITextAlign;
	verticalMargin?: IDistance | number;
	alignSelf?: IAlignSelf;
}

export const Text: FC<ITextProps> = ({
	children,
	className,
	fontSize,
	color = 'primaryText',
	backgroundColor,
	fontWeight = 'normal',
	mobileFontSize = fontSize,
	textAlign,
	verticalMargin = 'none',
	alignSelf = 'auto',
}) => {
	return (
		<StyledText
			className={className}
			fontSize={fontSize}
			color={color}
			backgroundColor={backgroundColor}
			fontWeight={fontWeight}
			mobileFontSize={mobileFontSize}
			textAlign={textAlign}
			verticalMargin={verticalMargin}
			alignSelf={alignSelf}
		>
			{children}
		</StyledText>
	);
};
