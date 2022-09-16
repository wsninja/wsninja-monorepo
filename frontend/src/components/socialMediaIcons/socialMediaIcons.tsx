import clsx from 'clsx';
import { ThemeIcon } from 'components/themeIcon/themeIcon';
import React, { FC, useMemo } from 'react';
import { SOCIAL_MEDIA } from '../../constants/social';
import './SocialMediaIcons.scss';

interface ISocialMediaIcons {
	className?: string;
}

export const SocialMediaIcons: FC<ISocialMediaIcons> = ({ className }) => {
	const renderSocialMediaIcons = useMemo(
		() =>
			SOCIAL_MEDIA.map(({ platform, href, title }) => (
				<a
					key={platform}
					className="WsnToast__link"
					href={href}
					target="_blank"
					rel="noreferrer noopener"
					title={title}
				>
					<ThemeIcon className="SocialMediaIcons__platform" name={platform} size={24} />
				</a>
			)),
		[]
	);

	return <div className={clsx('SocialMediaIcons', className)}>{renderSocialMediaIcons}</div>;
};
