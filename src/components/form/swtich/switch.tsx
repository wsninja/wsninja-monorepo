import clsx from 'clsx';
import React, { ChangeEventHandler, FC } from 'react';
import './Switch.scss';

interface ISwitchProps {
	className?: string;
	name: string;
	checked: boolean;
	onChange: ChangeEventHandler<HTMLInputElement>;
	size?: 's' | 'm';
}

export const Switch: FC<ISwitchProps> = ({ className, name, checked, onChange, size = 'm' }) => {
	return (
		<div className={clsx('Switch', className, size === 's' && 'Switch--small')}>
			<input type="checkbox" className="Switch__checkbox" name={name} id={name} checked={checked} onChange={onChange} />
			<label
				className={clsx('Switch__label', checked && 'Switch__label--checked', size === 's' && 'Switch__label--small')}
				htmlFor={name}
			>
				<span
					className={clsx(
						'Switch__label-inner',
						checked && 'Switch__label-inner--checked',
						size === 's' && 'Switch__label-inner--small'
					)}
				/>
			</label>
		</div>
	);
};
