import clsx from 'clsx';
import React, { FC, SelectHTMLAttributes } from 'react';
import './Select.scss';

export interface ISelectOption {
	title: string;
	value: string | number;
}

interface ISelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
	options: Array<ISelectOption>;
	current?: ISelectOption;
	isDarkTheme: boolean;
	onChange: (option: ISelectOption) => void;
}

export const Select: FC<ISelectProps> = ({
	className,
	options,
	current,
	placeholder,
	isDarkTheme,
	onChange,
	...props
}) => {
	return (
		<select
			className={clsx('Select', isDarkTheme && 'Select--dark', className)}
			value={current?.value || current?.title || placeholder}
			onChange={(e) => {
				const option = options.find((op) => op.value === e.target.value);
				if (option) {
					onChange(option);
				}
			}}
			{...props}
		>
			{!!placeholder && <option disabled>{placeholder}</option>}
			{options.map((option) => (
				<option value={option.value} key={option.value}>
					{option.title || option.value}
				</option>
			))}
		</select>
	);
};
