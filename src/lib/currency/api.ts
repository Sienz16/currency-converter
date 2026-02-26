import type { ExchangeRates } from './types';

const API_BASE = 'https://api.frankfurter.app';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
	rates: ExchangeRates;
	timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();

export async function fetchExchangeRates(base: string): Promise<ExchangeRates> {
	// Check cache first
	const cached = cache.get(base);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.rates;
	}

	// Fetch from API
	const response = await fetch(`${API_BASE}/latest?from=${base}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
	}

	const data = await response.json();

	const rates: ExchangeRates = {
		base: data.base,
		rates: data.rates,
		date: data.date
	};

	// Update cache
	cache.set(base, { rates, timestamp: Date.now() });

	return rates;
}

export function getCachedRates(base: string): ExchangeRates | null {
	const cached = cache.get(base);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.rates;
	}
	return null;
}

export function convertAmount(amount: number, fromRate: number, toRate: number): number {
	// Convert through base currency (EUR in frankfurter)
	// If rate is X per 1 EUR, then: amount * (toRate / fromRate)
	return amount * (toRate / fromRate);
}
