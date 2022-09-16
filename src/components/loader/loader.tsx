import clsx from 'clsx';
import { Icon } from 'components/icon/icon';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import './Loader.scss';

interface ILoaderProps {
	className?: string;
}

export const Loader: FC<ILoaderProps> = ({ className }) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	return (
		<div className={clsx('Loader', className, isDarkTheme && 'Loader--dark')}>
			<Icon className="Loader__icon" name="spinner" />
		</div>
	);
};
