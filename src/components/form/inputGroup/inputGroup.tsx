import clsx from 'clsx';
import { IInputProps, Input } from 'components/form/input/input';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store/store';
import './InputGroup.scss';

interface IInputGroupProps extends IInputProps {
	label: string;
	right: string | JSX.Element;
}

export const InputGroup: FC<IInputGroupProps> = ({ className, id, label, value, right, onChange, ...props }) => {
	const { isDarkTheme } = useSelector((state: IRootState) => state.theme);

	return (
		<div className={clsx('InputGroup', className)}>
			<label className="InputGroup__label" htmlFor={id}>
				{label}
			</label>
			<div className={clsx('InputGroup__wrapper', isDarkTheme && 'InputGroup__wrapper--dark')}>
				<Input
					id={id}
					value={value}
					onChange={onChange}
					className={clsx(
						'InputGroup__wrapper-input',
						className && `${className}-input`,
						isDarkTheme && 'InputGroup__wrapper-input--dark'
					)}
					{...props}
				/>
				{right}
			</div>
		</div>
	);
};
