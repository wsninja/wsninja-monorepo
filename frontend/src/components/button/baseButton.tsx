import { IStyledProps } from 'components/flex/types';
import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

export type IButtonType = 'primary' | 'secondary';

const StyledButton = styled.button`
	display: flex;
	background-color: transparent;
	border: none;
	cursor: pointer;
	margin: 0px;
	padding: 0px;
	user-select: none;
`;

export interface IBaseButtonProps extends IStyledProps {
	children?: ReactNode;
	disabled?: boolean;
	title?: string;
	onClick: () => void;
}

export const BaseButton: FC<IBaseButtonProps> = ({ children, id, className, disabled, title, onClick }) => (
	<StyledButton id={id} className={className} disabled={disabled} title={title} onClick={onClick}>
		{children}
	</StyledButton>
);
