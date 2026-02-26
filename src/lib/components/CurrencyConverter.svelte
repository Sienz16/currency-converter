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

	// Computed
	let convertedAmount = $derived.by(() => {
		if (!rates || !amount) return 0;
		const toRate = rates.rates[toCurrency];
		if (!toRate) return 0;
		if (fromCurrency === rates.base) return amount * toRate;
		const fromRate = rates.rates[fromCurrency];
		if (!fromRate) return 0;
		return convertAmount(amount, fromRate, toRate);
	});

	let currentRate = $derived.by(() => {
		if (!rates) return 0;
		const toRate = rates.rates[toCurrency];
		if (!toRate) return 0;
		if (fromCurrency === rates.base) return toRate;
		const fromRate = rates.rates[fromCurrency];
		if (!fromRate) return 0;
		return toRate / fromRate;
	});

	let fromCurrencyInfo = $derived(CURRENCIES.find(c => c.code === fromCurrency)!);
	let toCurrencyInfo = $derived(CURRENCIES.find(c => c.code === toCurrency)!);

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

	function swapCurrencies() {
		const temp = fromCurrency;
		fromCurrency = toCurrency;
		toCurrency = temp;
		loadRates();
	}

	onMount(() => loadRates());
</script>

<div class="min-h-screen bg-white flex flex-col">
	<!-- Header -->
	<header class="border-b-2 border-[#1a1a1a]">
		<div class="grid grid-cols-12">
			<div class="col-span-12 lg:col-span-7 p-8 lg:p-12 lg:pb-16">
				<div class="flex items-start gap-6">
					<div class="w-1 h-20 bg-[#e30613] shrink-0"></div>
					<div>
						<p class="text-[11px] uppercase tracking-[0.3em] text-[#666] mb-3">Foreign Exchange</p>
						<h1 class="text-5xl lg:text-7xl font-bold tracking-tight leading-[0.9] uppercase">
							Currency<br/>Exchange
						</h1>
					</div>
				</div>
			</div>
			<div class="col-span-12 lg:col-span-5 p-8 lg:p-12 lg:pb-16 border-t-2 lg:border-t-0 lg:border-l-2 border-[#1a1a1a] flex flex-col justify-end">
				<p class="text-xs uppercase tracking-[0.2em] text-[#666]">
					Real-time rates via Frankfurter API
				</p>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 grid grid-cols-12">
		<!-- Converter Section -->
		<section class="col-span-12 lg:col-span-7 p-8 lg:p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-[#1a1a1a]">
			<!-- Error -->
			{#if error}
				<div class="mb-10 p-5 border-l-4 border-[#e30613] bg-[#fff5f5]">
					<p class="text-sm text-[#e30613] font-medium">{error}</p>
				</div>
			{/if}

			<!-- Amount Input -->
			<div class="mb-12">
				<div class="flex items-center justify-between mb-3">
					<span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Amount</span>
				</div>
				<div class="relative">
					<input
						type="number"
						bind:value={amount}
						min="0"
						step="0.01"
						class="w-full h-24 lg:h-32 text-6xl lg:text-7xl font-bold bg-transparent border-b-2 border-[#1a1a1a] focus:border-[#e30613] outline-none font-mono tabular-nums placeholder:text-[#ddd] transition-colors"
						placeholder="0"
					/>
					<div class="absolute right-0 bottom-4">
						<select
							bind:value={fromCurrency}
							onchange={loadRates}
							class="h-12 px-4 mr-2 text-lg font-bold bg-white border-2 border-[#1a1a1a] hover:border-[#e30613] focus:border-[#e30613] outline-none cursor-pointer pr-10 transition-colors"
						>
							{#each CURRENCIES as currency (currency.code)}
								<option value={currency.code}>{currency.code}</option>
							{/each}
						</select>
					</div>
				</div>
				<p class="mt-2 text-xs text-[#999]">{fromCurrencyInfo.name}</p>
			</div>

			<!-- Swap Button -->
			<div class="flex items-center gap-4 my-8">
				<div class="flex-1 h-px bg-[#ddd]"></div>
				<button
					onclick={swapCurrencies}
					class="group w-16 h-16 flex items-center justify-center bg-[#1a1a1a] text-white hover:bg-[#e30613] active:scale-95 transition-all"
					aria-label="Swap currencies"
				>
					<svg class="group-hover:rotate-180 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M7 10h14l-4-4"/>
						<path d="M17 14H3l4 4"/>
					</svg>
				</button>
				<div class="flex-1 h-px bg-[#ddd]"></div>
			</div>

			<!-- Result -->
			<div class="mb-12">
				<div class="flex items-center justify-between mb-3">
					<span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Converted Amount</span>
					{#if loading}
						<span class="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#999]">
							<span class="w-2 h-2 bg-[#e30613] animate-pulse"></span>
							Updating
						</span>
					{/if}
				</div>
				<div class="relative">
					<div class="w-full min-h-24 lg:min-h-32 text-6xl lg:text-7xl font-bold font-mono tabular-nums flex items-center text-[#e30613] border-b-2 border-[#1a1a1a] break-all">
						{loading ? '···' : convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</div>
					<div class="absolute right-0 bottom-4">
						<select
							bind:value={toCurrency}
							class="h-12 px-4 mr-2 text-lg font-bold bg-white border-2 border-[#1a1a1a] hover:border-[#e30613] focus:border-[#e30613] outline-none cursor-pointer pr-10 transition-colors"
						>
							{#each CURRENCIES as currency (currency.code)}
								<option value={currency.code}>{currency.code}</option>
							{/each}
						</select>
					</div>
				</div>
				<p class="mt-2 text-xs text-[#999]">{toCurrencyInfo.name}</p>
			</div>

			<!-- Rate Info Grid -->
			<div class="grid grid-cols-2 gap-8 pt-8 border-t border-[#eee]">
				<div>
					<span class="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] mb-2">Rate</span>
					<span class="text-xl font-mono tabular-nums font-medium">
						1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
					</span>
				</div>
				<div class="text-right">
					<span class="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#999] mb-2">Updated</span>
					<span class="text-sm text-[#666] font-mono">
						{lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
					</span>
				</div>
			</div>
		</section>

		<!-- Reference Rates Sidebar -->
		<aside class="col-span-12 lg:col-span-5 bg-[#fafafa]">
			<div class="p-8 lg:p-12">
				<!-- Info Card -->
				<div class="mb-8 p-5 bg-white border border-[#e5e5e5]">
					<div class="flex items-start gap-4">
						<div class="w-1 h-full min-h-[2.5rem] bg-[#e30613] shrink-0"></div>
						<div>
							<p class="text-xs leading-relaxed text-[#666]">
								Rates are updated every 5 minutes via Frankfurter API.
							</p>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-3 mb-8">
					<div class="w-8 h-[2px] bg-[#1a1a1a]"></div>
					<h2 class="text-xs font-bold uppercase tracking-[0.25em]">Reference Rates</h2>
				</div>

				<div class="space-y-0">
					{#each ['USD', 'EUR', 'SGD', 'GBP', 'JPY', 'AUD'] as code (code)}
						{@const currency = CURRENCIES.find(c => c.code === code)}
						{@const rate = rates?.rates[code]}
						{#if rate && currency}
							<div class="group flex items-center justify-between py-5 border-b border-[#e5e5e5] hover:border-[#1a1a1a] transition-colors">
								<div class="flex items-center gap-4">
									<span class="text-3xl group-hover:scale-110 transition-transform">{currency.flag}</span>
									<div>
										<span class="block text-base font-bold">{code}</span>
										<span class="block text-[10px] text-[#999] uppercase tracking-wider">{currency.name}</span>
									</div>
								</div>
								<div class="text-right">
									<span class="block text-xl font-mono tabular-nums font-medium">{rate.toFixed(4)}</span>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</aside>
	</main>

	<!-- Footer -->
	<footer class="border-t-2 border-[#1a1a1a] bg-white">
		<div class="grid grid-cols-12">
			<div class="col-span-12 lg:col-span-7 p-6 lg:p-8">
				<span class="text-[10px] uppercase tracking-[0.2em] text-[#999]">
					Data: <a href="https://frankfurter.app" target="_blank" rel="noopener" class="underline hover:text-[#e30613] transition-colors">Frankfurter</a>
				</span>
			</div>
			<div class="col-span-12 lg:col-span-5 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-[#1a1a1a] flex lg:justify-end">
				<span class="text-[10px] uppercase tracking-[0.2em] text-[#999]">
					{new Date().getFullYear()}
				</span>
			</div>
		</div>
	</footer>
</div>
