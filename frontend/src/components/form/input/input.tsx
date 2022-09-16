import clsx from 'clsx';
import React, { FC, InputHTMLAttributes } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import './Input.scss';

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input: FC<IInputProps> = ({ className, ...props }) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	return <input className={clsx('Input', isDarkTheme && 'Input--dark', className)} {...props} />;
};
