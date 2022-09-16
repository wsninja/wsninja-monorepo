const setColor = (name: string, value: string) => {
	document.documentElement.style.setProperty(name, value);
};

export const changeTheme = (isDark = false) => {
	if (isDark) {
		// setColor('--color-black', '#fff')
		// setColor('--color-charcoal', '#fff')
		// setColor('--color-white', '#1d1d1d')
	} else {
		// setColor('--color-black', '#000')
		// setColor('--color-charcoal', '#1d1d1d')
		setColor('--color-white', '#fff');
	}
};
