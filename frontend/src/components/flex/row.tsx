import { BaseFlex, IBaseFlexProps } from 'components/flex/baseFlex';
import { IDistance } from 'components/flex/types';
import { getDistance, toPx } from 'components/flex/utils';
import { FC } from 'react';
import styled from 'styled-components';

const StyledRow = styled(BaseFlex)<{ gap: IDistance | number }>`
	flex-direction: row;
	column-gap: ${({ theme, gap }) => toPx(getDistance(theme, gap))};
`;

type IRowProps = Omit<IBaseFlexProps, 'direction'>;

export const Row: FC<IRowProps> = ({ children, gap = 'none', ...props }) => {
	return (
		<StyledRow direction="row" gap={gap} {...props}>
			{children}
		</StyledRow>
	);
};
