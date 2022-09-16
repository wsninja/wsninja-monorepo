import { Button, IButtonProps, IButtonSize } from 'components/button/button';
import { Text } from 'components/text/text';
import React, { FC } from 'react';
import styled from 'styled-components';

const StyledTextButton = styled(Button)<{ fullWidth: boolean }>`
	flex-direction: row;
	justify-content: center;
	align-items: center;
	opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : undefined)};
`;

const LeftIcon = styled.img<{ size: IButtonSize }>`
	max-height: ${({ size }) => (size === 's' ? '20px' : '23px')};
	margin-right: 6px;
`;

const RightIcon = styled.img<{ size: IButtonSize }>`
	max-height: ${({ size }) => (size === 's' ? '20px' : '23px')};
	margin-left: 6px;
`;

interface ITextButtonProps extends IButtonProps {
	text: string;
	leftIcon?: string;
	rightIcon?: string;
	fullWidth?: boolean;
}

export const TextButton: FC<ITextButtonProps> = ({ text, leftIcon, rightIcon, fullWidth, ...props }) => {
	const { size = 'm' } = props;

	return (
		<StyledTextButton fullWidth={fullWidth ?? false} {...props}>
			{leftIcon && <LeftIcon src={leftIcon} size={size} />}
			<Text fontSize={size === 'm' ? 'l' : 's'} fontWeight="semibold" color="inherit">
				{text}
			</Text>
			{rightIcon && <RightIcon src={rightIcon} size={size} />}
		</StyledTextButton>
	);
};
