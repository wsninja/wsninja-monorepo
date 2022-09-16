import { BaseFlex, IBaseFlexProps } from 'components/flex/baseFlex';
import { IDistance } from 'components/flex/types';
import { getDistance, toPx } from 'components/flex/utils';
import { FC } from 'react';
import styled from 'styled-components';

const StyledCol = styled(BaseFlex)<{ gap: IDistance | number }>`
	flex-direction: column;
	row-gap: ${({ theme, gap }) => toPx(getDistance(theme, gap))};
`;

type IColProps = Omit<IBaseFlexProps, 'direction'>;

export const Col: FC<IColProps> = ({ children, gap = 'none', ...props }) => {
	return (
		<StyledCol direction="column" gap={gap} {...props}>
			{children}
		</StyledCol>
	);
};
