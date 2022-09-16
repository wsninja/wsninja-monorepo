export const capitalize = (str: string): string => {
	if (!str) {
		return str;
	}
	const capitalizedStr = str.slice(0, 1).toUpperCase() + str.slice(1);
	return capitalizedStr;
};
