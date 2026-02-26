# Currency Exchange Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use @superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modern fintech-style currency exchange website with live rates from frankfurter.app API

**Architecture:** Single SvelteKit page with reactive state management using Svelte 5 runes. Fetch exchange rates from free API, cache them client-side, and provide real-time conversion with swap functionality.

**Tech Stack:** Svelte 5, SvelteKit, Tailwind CSS v4, TypeScript, frankfurter.app API

---

## Task 1: Create Currency Types and Constants

**Files:**

- Create: `src/lib/currency/types.ts`

**Step 1: Write the type definitions**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/currency/types.ts
git commit -m "feat: add currency types and constants"
```

---

## Task 2: Create Exchange Rate API Service

**Files:**

- Create: `src/lib/currency/api.ts`

**Step 1: Write the API service**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/currency/api.ts
git commit -m "feat: add exchange rate API service with caching"
```

---

## Task 3: Update Global Styles

**Files:**

- Modify: `src/routes/layout.css`

**Step 1: Add fintech styling**

```css
@import 'tailwindcss';

/* Custom color palette */
:root {
	--color-bg-primary: #0f172a;
	--color-bg-secondary: #1e293b;
	--color-bg-card: #1e293b;
	--color-accent-primary: #06b6d4;
	--color-accent-secondary: #14b8a6;
	--color-text-primary: #f8fafc;
	--color-text-secondary: #94a3b8;
	--color-border: #334155;
}

html {
	background-color: var(--color-bg-primary);
	color: var(--color-text-primary);
	font-family:
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		'Segoe UI',
		Roboto,
		sans-serif;
}

body {
	min-height: 100vh;
	background: linear-gradient(135deg, var(--color-bg-primary) 0%, #1a1f2e 100%);
}

/* Smooth transitions */
* {
	transition-property: background-color, border-color, color, fill, stroke;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 150ms;
}

/* Tabular numbers for clean alignment */
.tabular-nums {
	font-variant-numeric: tabular-nums;
}

/* Custom scrollbar */
::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

::-webkit-scrollbar-track {
	background: var(--color-bg-primary);
}

::-webkit-scrollbar-thumb {
	background: var(--color-border);
	border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
	background: var(--color-text-secondary);
}
```

**Step 2: Commit**

```bash
git add src/routes/layout.css
git commit -m "feat: add fintech color scheme and base styles"
```

---

## Task 4: Create Currency Converter Component

**Files:**

- Create: `src/lib/components/CurrencyConverter.svelte`

**Step 1: Write the component**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchExchangeRates, convertAmount } from '$lib/currency/api';
	import { CURRENCIES, DEFAULT_FROM, DEFAULT_TO } from '$lib/currency/types';
	import type { ExchangeRates } from '$lib/currency/types';

	// State
	let amount = $state(1);
	let fromCurrency = $state(DEFAULT_FROM);
	let toCurrency = $state(DEFAULT_TO);
	let rates: ExchangeRates | null = $state(null);
	let loading = $state(true);
	let error: string | null = $state(null);
	let lastUpdated = $state<Date | null>(null);
	let isSwapping = $state(false);

	// Computed
	let convertedAmount = $derived(() => {
		if (!rates || !amount) return 0;
		const toRate = rates.rates[toCurrency];
		if (!toRate) return 0;
		// frankfurter returns rates relative to base
		if (fromCurrency === rates.base) {
			return amount * toRate;
		}
		// Need to convert through base currency
		const fromRate = rates.rates[fromCurrency];
		if (!fromRate) return 0;
		return convertAmount(amount, fromRate, toRate);
	});

	let currentRate = $derived(() => {
		if (!rates) return 0;
		const toRate = rates.rates[toCurrency];
		if (!toRate) return 0;
		if (fromCurrency === rates.base) return toRate;
		const fromRate = rates.rates[fromCurrency];
		if (!fromRate) return 0;
		return toRate / fromRate;
	});

	let fromCurrencyInfo = $derived(CURRENCIES.find((c) => c.code === fromCurrency)!);
	let toCurrencyInfo = $derived(CURRENCIES.find((c) => c.code === toCurrency)!);

	// Fetch rates when fromCurrency changes
	async function loadRates() {
		loading = true;
		error = null;
		try {
			rates = await fetchExchangeRates(fromCurrency);
			lastUpdated = new Date();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load exchange rates';
		} finally {
			loading = false;
		}
	}

	// Swap currencies
	async function swapCurrencies() {
		isSwapping = true;
		const temp = fromCurrency;
		fromCurrency = toCurrency;
		toCurrency = temp;
		await loadRates();
		setTimeout(() => {
			isSwapping = false;
		}, 300);
	}

	// Load initial rates
	onMount(() => {
		loadRates();
	});
</script>

<div class="mx-auto w-full max-w-2xl">
	<!-- Main Converter Card -->
	<div
		class="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl"
	>
		<!-- Gradient accent line -->
		<div
			class="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]"
		></div>

		<div class="p-6 md:p-8">
			<!-- Header -->
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
					Currency Exchange
				</h1>
				<p class="text-[var(--color-text-secondary)]">
					Real-time exchange rates powered by Frankfurter
				</p>
			</div>

			<!-- Error Message -->
			{#if error}
				<div
					class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
				>
					{error}
				</div>
			{/if}

			<!-- Input Section -->
			<div class="space-y-4">
				<!-- From Currency -->
				<div class="relative">
					<label
						class="mb-2 block text-xs font-medium tracking-wider text-[var(--color-text-secondary)] uppercase"
					>
						From
					</label>
					<div class="flex gap-3">
						<div class="relative flex-1">
							<span class="absolute top-1/2 left-4 -translate-y-1/2 text-2xl">
								{fromCurrencyInfo.flag}
							</span>
							<input
								type="number"
								bind:value={amount}
								min="0"
								step="0.01"
								class="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-4 pr-4 pl-14 text-xl font-semibold text-[var(--color-text-primary)] tabular-nums placeholder-[var(--color-text-secondary)] focus:border-transparent focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:outline-none"
								placeholder="0.00"
							/>
						</div>
						<select
							bind:value={fromCurrency}
							onchange={loadRates}
							class="w-28 cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-4 text-lg font-semibold text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:outline-none"
						>
							{#each CURRENCIES as currency}
								<option value={currency.code}>
									{currency.code}
								</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Swap Button -->
				<div class="relative z-10 -my-2 flex justify-center">
					<button
						onclick={swapCurrencies}
						disabled={isSwapping}
						class="rounded-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] p-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Swap currencies"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="transition-transform duration-300 {isSwapping ? 'rotate-180' : ''}"
						>
							<path d="M7 10h14l-4-4" />
							<path d="M17 14H3l4 4" />
						</svg>
					</button>
				</div>

				<!-- To Currency -->
				<div class="relative">
					<label
						class="mb-2 block text-xs font-medium tracking-wider text-[var(--color-text-secondary)] uppercase"
					>
						To
					</label>
					<div class="flex gap-3">
						<div class="relative flex-1">
							<span class="absolute top-1/2 left-4 -translate-y-1/2 text-2xl">
								{toCurrencyInfo.flag}
							</span>
							<input
								type="text"
								value={loading
									? '...'
									: convertedAmount().toLocaleString('en-US', {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										})}
								readonly
								class="w-full cursor-default rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 py-4 pr-4 pl-14 text-xl font-semibold text-[var(--color-accent-primary)] tabular-nums"
							/>
						</div>
						<select
							bind:value={toCurrency}
							class="w-28 cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-4 text-lg font-semibold text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:outline-none"
						>
							{#each CURRENCIES as currency}
								<option value={currency.code}>
									{currency.code}
								</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			<!-- Rate Info -->
			<div
				class="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 p-4"
			>
				<div class="flex items-center justify-between text-sm">
					<span class="text-[var(--color-text-secondary)]"> Current Rate </span>
					<span class="font-medium text-[var(--color-text-primary)] tabular-nums">
						1 {fromCurrency} = {currentRate().toLocaleString('en-US', {
							minimumFractionDigits: 4,
							maximumFractionDigits: 4
						})}
						{toCurrency}
					</span>
				</div>
				{#if lastUpdated}
					<div class="mt-2 text-xs text-[var(--color-text-secondary)]">
						Last updated: {lastUpdated.toLocaleTimeString()}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Popular Rates -->
	<div class="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
		<h2 class="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
			Popular Exchange Rates
		</h2>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
			{#each ['USD', 'EUR', 'SGD', 'GBP', 'JPY', 'AUD'] as code}
				{@const currency = CURRENCIES.find((c) => c.code === code)}
				{@const rate = rates?.rates[code]}
				{#if rate && currency}
					<div
						class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 p-3"
					>
						<div class="mb-1 flex items-center gap-2">
							<span class="text-lg">{currency.flag}</span>
							<span class="font-medium text-[var(--color-text-primary)]">{code}</span>
						</div>
						<div class="text-sm text-[var(--color-accent-primary)] tabular-nums">
							{rate.toFixed(4)}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>
```

**Step 2: Commit**

```bash
git add src/lib/components/CurrencyConverter.svelte
git commit -m "feat: create currency converter component"
```

---

## Task 5: Update Main Page

**Files:**

- Modify: `src/routes/+page.svelte`

**Step 1: Replace page content**

```svelte
<script lang="ts">
	import CurrencyConverter from '$lib/components/CurrencyConverter.svelte';
</script>

<svelte:head>
	<title>Currency Exchange | MYR to IDR</title>
	<meta
		name="description"
		content="Real-time currency exchange rates. Convert MYR to IDR and more."
	/>
</svelte:head>

<main class="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-7xl">
		<CurrencyConverter />

		<!-- Footer -->
		<footer class="mt-12 text-center text-sm text-[var(--color-text-secondary)]">
			<p>
				Exchange rates provided by <a
					href="https://frankfurter.app"
					target="_blank"
					rel="noopener noreferrer"
					class="text-[var(--color-accent-primary)] hover:underline">Frankfurter</a
				>
			</p>
			<p class="mt-1">Rates are for informational purposes only</p>
		</footer>
	</div>
</main>
```

**Step 2: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: update main page with currency converter"
```

---

## Task 6: Test the Application

**Files:**

- Test in browser

**Step 1: Run dev server**

```bash
bun run dev
```

**Step 2: Open browser**
Navigate to http://localhost:5173

**Step 3: Verify functionality**

- [ ] Default shows MYR → IDR
- [ ] Enter amount and see real-time conversion
- [ ] Swap button reverses currencies
- [ ] Changing "From" currency fetches new rates
- [ ] Rate display updates correctly
- [ ] Popular rates section shows 6 currencies
- [ ] Last updated timestamp appears
- [ ] No console errors

**Step 4: Commit**

```bash
git add -A
git commit -m "test: verify currency exchange functionality"
```

---

## Completion Summary

The currency exchange website is now complete with:

1. ✅ Modern fintech design with dark theme and teal accents
2. ✅ Live exchange rates from frankfurter.app API
3. ✅ Real-time conversion as user types
4. ✅ Swap functionality with animation
5. ✅ 10 supported currencies with flags
6. ✅ Popular rates display
7. ✅ Client-side caching (5 minutes)
8. ✅ Error handling
9. ✅ Responsive design

**Next steps:**

- Run `bun run build` to create production build
- Run `bun run preview` to test production build locally
