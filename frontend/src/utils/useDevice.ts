import { useEffect, useMemo, useState } from 'react';
import { mobileThreshold } from 'styles/base';

export const useDevice = (): { isMobile: boolean; isDesktop: boolean } => {
	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => {
			setWidth(window.innerWidth);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [setWidth]);

	const device = useMemo(() => {
		if (width > mobileThreshold) {
			return { isMobile: false, isDesktop: true };
		}
		return { isMobile: true, isDesktop: false };
	}, [width]);

	return device;
};
