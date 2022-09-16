import { BaseFlex, IBaseFlexProps } from 'components/flex/baseFlex';
import { FC } from 'react';
import styled from 'styled-components';

const StyledCard = styled(BaseFlex)`
	border-radius: 10px;
	box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
	background-color: ${({ theme }) => theme.color.primaryBackground};
`;

export interface ICardProps extends IBaseFlexProps {}

export const Card: FC<ICardProps> = ({ children, ...props }) => {
	return <StyledCard {...props}>{children}</StyledCard>;
};
