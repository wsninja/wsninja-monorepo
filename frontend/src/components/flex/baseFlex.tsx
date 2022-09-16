import {
	IAlignContent,
	IAlignItems,
	IColor,
	IDistance,
	IFlexDirection,
	IJustifyContent,
	IStyledProps,
} from 'components/flex/types';
import { getColor, getDistance, toPx } from 'components/flex/utils';
import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

const StyledBaseFlex = styled.div<{
	direction: IFlexDirection;
	justifyContent?: IJustifyContent;
	alignItems?: IAlignItems;
	alignContent?: IAlignContent;
	horizontalMargin: IDistance | number;
	verticalMargin: IDistance | number;
	horizontalPadding: IDistance | number;
	verticalPadding: IDistance | number;
	backgroundColor?: IColor;
	fullWidth: boolean;
}>`
	display: flex;
	box-sizing: border-box;
	flex-direction: ${({ direction }) => direction};
	justify-content: ${({ justifyContent }) => justifyContent};
	align-items: ${({ alignItems }) => alignItems};
	align-content: ${({ alignContent }) => alignContent};
	margin-left: ${({ theme, horizontalMargin }) => toPx(getDistance(theme, horizontalMargin))};
	margin-right: ${({ theme, horizontalMargin }) => toPx(getDistance(theme, horizontalMargin))};
	margin-top: ${({ theme, verticalMargin }) => toPx(getDistance(theme, verticalMargin))};
	margin-bottom: ${({ theme, verticalMargin }) => toPx(getDistance(theme, verticalMargin))};
	padding-left: ${({ theme, horizontalPadding }) => toPx(getDistance(theme, horizontalPadding))};
	padding-right: ${({ theme, horizontalPadding }) => toPx(getDistance(theme, horizontalPadding))};
	padding-top: ${({ theme, verticalPadding }) => toPx(getDistance(theme, verticalPadding))};
	padding-bottom: ${({ theme, verticalPadding }) => toPx(getDistance(theme, verticalPadding))};
	background-color: ${({ theme, backgroundColor }) => getColor(theme, backgroundColor)};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : undefined)};
`;

export interface IBaseFlexProps extends IStyledProps {
	children?: ReactNode;
	direction: IFlexDirection;
	mobileDirection?: IFlexDirection;
	justifyContent?: IJustifyContent;
	alignItems?: IAlignItems;
	alignContent?: IAlignContent;
	gap?: IDistance | number;
	horizontalMargin?: IDistance | number;
	verticalMargin?: IDistance | number;
	horizontalPadding?: IDistance | number;
	verticalPadding?: IDistance | number;
	backgroundColor?: IColor;
	fullWidth?: boolean;
}

export const BaseFlex: FC<IBaseFlexProps> = ({
	children,
	id,
	className,
	direction,
	mobileDirection,
	justifyContent,
	alignItems,
	alignContent,
	horizontalMargin = 'none',
	verticalMargin = 'none',
	horizontalPadding = 'none',
	verticalPadding = 'none',
	backgroundColor,
	fullWidth = false,
}) => (
	<StyledBaseFlex
		id={id}
		className={className}
		direction={mobileDirection ?? direction}
		justifyContent={justifyContent}
		alignItems={alignItems}
		alignContent={alignContent}
		horizontalMargin={horizontalMargin}
		verticalMargin={verticalMargin}
		horizontalPadding={horizontalPadding}
		verticalPadding={verticalPadding}
		backgroundColor={backgroundColor}
		fullWidth={fullWidth}
	>
		{children}
	</StyledBaseFlex>
);
