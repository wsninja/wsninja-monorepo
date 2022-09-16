import clsx from 'clsx';
import React, { FC, ReactNode } from 'react';
import { PulseLoader } from 'react-spinners';
import { useTheme } from 'styled-components';
import './Button.scss';

interface IButtonProps {
	children?: ReactNode;
	className?: string;
	variant?: 'solid' | 'ghost' | 'outline';
	color?: 'primary' | 'secondary';
	type?: 'button' | 'submit';
	size?: 'sm' | 'lg';
	isDarkTheme?: boolean;
	fullWidth?: boolean;
	loading?: boolean;
	onClick?: () => void;
}

export const Button: FC<IButtonProps> = ({
	children,
	className,
	variant,
	color,
	onClick,
	type = 'button',
	size = 'sm',
	isDarkTheme = false,
	fullWidth = false,
	loading = false,
}) => {
	const theme = useTheme();

	return (
		<button
			className={clsx(
				'Button',
				`Button--${variant}`,
				`Button--${loading ? 'gray' : color}`,
				`Button--${size}`,
				isDarkTheme && `Button--dark`,
				fullWidth && `Button--full`,
				className
			)}
			onClick={onClick}
			type={type}
			disabled={loading}
		>
			{loading ? <PulseLoader color={theme.color.primaryBrand} /> : children}
		</button>
	);
};
