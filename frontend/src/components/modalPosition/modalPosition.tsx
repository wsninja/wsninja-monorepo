import { Col } from 'components/flex/col';
import { toPx } from 'components/flex/utils';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { useDevice } from 'utils/useDevice';

const Absolute = styled(Col)<{ x: number; y: number }>`
	position: absolute;
	left: ${({ x }) => toPx(x)};
	top: ${({ y }) => toPx(y)};
	transform: translateX(-100%);
`;

interface IModalPositionProps {
	children?: ReactNode;
	x: number;
	y: number;
}

export const ModalPosition: FC<IModalPositionProps> = ({ children, x, y }) => {
	const { isDesktop } = useDevice();

	if (isDesktop) {
		return (
			<Absolute x={x} y={y}>
				{children}
			</Absolute>
		);
	}
	return <Col>{children}</Col>;
};
