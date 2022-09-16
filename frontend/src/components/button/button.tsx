import { BaseButton, IBaseButtonProps } from 'components/button/baseButton';
import React, { FC } from 'react';
import styled from 'styled-components';

export type IButtonType = 'primary' | 'secondary' | 'ghost' | 'dfinity';

export type IButtonSize = 's' | 'm';

const StyledButton = styled(BaseButton)<{ type: IButtonType; size: IButtonSize }>`
	color: ${({ theme, type }) => {
		const {
			mode,
			color: { white, black, red },
		} = theme;
		switch (mode) {
			case 'light':
				switch (type) {
					case 'primary':
						return white;
					case 'secondary':
					case 'dfinity':
						return red;
					case 'ghost':
						return black;
				}
			case 'dark':
				switch (type) {
					case 'primary':
					case 'secondary':
					case 'ghost':
						return white;
					case 'dfinity':
						return red;
				}
		}
	}};
	background-color: ${({ theme, type }) => {
		const {
			mode,
			color: { white, black, red },
		} = theme;
		switch (mode) {
			case 'light':
				switch (type) {
					case 'primary':
						return red;
					case 'secondary':
						return white;
					case 'ghost':
					case 'dfinity':
						return 'transparent';
				}
			case 'dark':
				switch (type) {
					case 'primary':
						return red;
					case 'secondary':
						return black;
					case 'ghost':
					case 'dfinity':
						return 'transparent';
				}
		}
	}};
	border: 1px solid;
	border-color: ${({ theme, type }) => {
		const {
			mode,
			color: { white, red },
		} = theme;
		switch (mode) {
			case 'light':
				switch (type) {
					case 'primary':
					case 'secondary':
						return red;
					case 'ghost':
					case 'dfinity':
						return 'transparent';
				}
			case 'dark':
				switch (type) {
					case 'primary':
						return red;
					case 'secondary':
						return white;
					case 'ghost':
					case 'dfinity':
						return 'transparent';
				}
		}
	}};
	border-radius: 4px;
	padding-left: 12px;
	padding-right: 12px;
	padding-top: ${({ size }) => (size === 's' ? '6px' : '8px')};
	padding-bottom: ${({ size }) => (size === 's' ? '6px' : '8px')};
	box-shadow: ${({ type }) => (type === 'ghost' || type === 'dfinity' ? '5px 5px 5px rgba(0, 0, 0, 0.15)' : undefined)};

	&:hover {
		box-shadow: ${({ type }) =>
			type === 'ghost' || type === 'dfinity' ? 'inset 5px 5px 5px rgba(0, 0, 0, 0.15)' : undefined};
	}
`;

export interface IButtonProps extends IBaseButtonProps {
	type: IButtonType;
	size?: IButtonSize;
}

export const Button: FC<IButtonProps> = ({ children, size = 'm', ...props }) => {
	return (
		<StyledButton size={size} {...props}>
			{children}
		</StyledButton>
	);
};
