import clsx from 'clsx';
import { Icon, IIconProps } from 'components/icon/icon';
import React, { FC } from 'react';
import './ThemeIcon.scss';

type IThemeIconProps = IIconProps;

export const ThemeIcon: FC<IThemeIconProps> = ({ className, name, size, ...props }) => {
	return <Icon className={clsx('ThemeIcon', className)} name={name} size={size} {...props} />;
};
