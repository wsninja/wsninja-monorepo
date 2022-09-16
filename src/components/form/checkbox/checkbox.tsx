import clsx from 'clsx';
import { Icon } from 'components/icon/icon';
import React, { FC, InputHTMLAttributes } from 'react';
import './Checkbox.scss';

type ICheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox: FC<ICheckboxProps> = ({ className, checked, ...props }) => {
	return (
		<div className={clsx('Checkbox', className)}>
			<input className="Checkbox__input" type="checkbox" checked={checked} {...props} />
			<span className={clsx('Checkbox__box', checked && 'Checkbox__box--checked')}>
				{!!checked && (
					<Icon
						className={clsx('Checkbox__box-icon', checked && 'Checkbox__box-icon--checked')}
						name="check"
						size={8}
					/>
				)}
			</span>
		</div>
	);
};
