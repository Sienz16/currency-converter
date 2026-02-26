export interface ExchangeRates {
	base: string;
	rates: Record<string, number>;
	date: string;
}

export interface Currency {
	code: string;
	name: string;
	symbol: string;
	flag: string;
}

export const CURRENCIES: Currency[] = [
	{ code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
	{ code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
	{ code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
	{ code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
	{ code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
	{ code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
	{ code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
	{ code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
	{ code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
	{ code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' }
];

export const DEFAULT_FROM = 'MYR';
export const DEFAULT_TO = 'IDR';
