import { IDistance } from 'components/flex/types';
import { getDistance, toPx } from 'components/flex/utils';
import React, { FC } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { useDevice } from 'utils/useDevice';

const getExtDistance = (theme: DefaultTheme, distance: IDistance | number): number => {
	if (typeof distance === 'number') {
		return distance;
	}
	return getDistance(theme, distance);
};

const StyledSpacing = styled.div<{
	horizontal: IDistance | number | undefined;
	vertical: IDistance | number | undefined;
}>`
	display: flex;
	height: ${({ theme, vertical }) => (vertical === undefined ? undefined : toPx(getExtDistance(theme, vertical)))};
	min-height: ${({ theme, vertical }) => (vertical === undefined ? undefined : toPx(getExtDistance(theme, vertical)))};
	max-height: ${({ theme, vertical }) => (vertical === undefined ? undefined : toPx(getExtDistance(theme, vertical)))};
	width: ${({ theme, horizontal }) => (horizontal === undefined ? undefined : toPx(getExtDistance(theme, horizontal)))};
	min-width: ${({ theme, horizontal }) =>
		horizontal === undefined ? undefined : toPx(getExtDistance(theme, horizontal))};
	max-width: ${({ theme, horizontal }) =>
		horizontal === undefined ? undefined : toPx(getExtDistance(theme, horizontal))};
`;

interface ISpacingProps {
	className?: string;
	horizontal?: IDistance | number;
	vertical?: IDistance | number;
	mobile?: IDistance | number;
	desktopOnly?: boolean;
	mobileOnly?: boolean;
}

export const Spacing: FC<ISpacingProps> = ({ className, horizontal, vertical, mobile, desktopOnly, mobileOnly }) => {
	const { isDesktop, isMobile } = useDevice();

	if (isMobile && desktopOnly) {
		return null;
	}
	if (isDesktop && mobileOnly) {
		return null;
	}
	if (isMobile && mobile) {
		if (horizontal) {
			// eslint-disable-next-line no-param-reassign
			horizontal = mobile;
		}
		if (vertical) {
			// eslint-disable-next-line no-param-reassign
			vertical = mobile;
		}
	}

	return <StyledSpacing className={className} horizontal={horizontal} vertical={vertical} />;
};
