import { Card, ICardProps } from 'components/card/card';
import { toPx } from 'components/flex/utils';
import { FC } from 'react';
import styled from 'styled-components';
import { useDevice } from 'utils/useDevice';

const StyledPageCard = styled(Card)`
	max-width: 666px;
	align-self: center;

	@media (max-width: ${({ theme }) => toPx(theme.mobileThreshold)}) {
		box-shadow: none;
		border-radius: 0px;
	}
`;

interface IPageCardProps extends ICardProps {}

export const PageCard: FC<IPageCardProps> = ({ children, ...props }) => {
	const { isDesktop } = useDevice();

	return (
		<StyledPageCard
			horizontalPadding={isDesktop ? '5xl' : 'none'}
			verticalPadding={isDesktop ? '3xl' : 'none'}
			{...props}
		>
			{children}
		</StyledPageCard>
	);
};
