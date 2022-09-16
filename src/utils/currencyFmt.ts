export const currencyFmt = (amount: number, long = false): string =>
	long
		? new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 10,
		  }).format(amount)
		: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
		  }).format(amount);
