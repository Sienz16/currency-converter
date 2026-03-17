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

	let fromCurrencyInfo = $derived(CURRENCIES.find((c) => c.code === fromCurrency)!);
	let toCurrencyInfo = $derived(CURRENCIES.find((c) => c.code === toCurrency)!);

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

<div class="flex min-h-screen flex-col bg-white">
	<!-- Header -->
	<header class="border-b-2 border-[#1a1a1a]">
		<div class="grid grid-cols-12">
			<div class="col-span-12 p-5 sm:p-8 lg:col-span-7 lg:p-12 lg:pb-16">
				<div class="flex items-start gap-4 sm:gap-6">
					<div class="h-16 w-1 shrink-0 bg-[#e30613] sm:h-20"></div>
					<div>
						<p class="mb-2 text-[10px] tracking-[0.3em] text-[#666] uppercase sm:mb-3 sm:text-[11px]">
							Foreign Exchange
						</p>
						<h1 class="text-4xl leading-[0.9] font-bold tracking-tight uppercase sm:text-5xl lg:text-7xl">
							Currency<br />Exchange
						</h1>
					</div>
				</div>
			</div>
			<div
				class="col-span-12 flex flex-col justify-end border-t-2 border-[#1a1a1a] p-5 sm:p-8 lg:col-span-5 lg:border-t-0 lg:border-l-2 lg:p-12 lg:pb-16"
			>
				<p class="text-[10px] tracking-[0.2em] text-[#666] uppercase sm:text-xs">
					Real-time rates via Frankfurter API
				</p>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="grid flex-1 grid-cols-12">
		<!-- Converter Section -->
		<section
			class="col-span-12 border-b-2 border-[#1a1a1a] p-5 sm:p-8 lg:col-span-7 lg:border-r-2 lg:border-b-0 lg:p-12"
		>
			<!-- Error -->
			{#if error}
				<div class="mb-8 border-l-4 border-[#e30613] bg-[#fff5f5] p-4 sm:mb-10 sm:p-5">
					<p class="text-sm font-medium text-[#e30613]">{error}</p>
				</div>
			{/if}

			<!-- Amount Input -->
			<div class="mb-10 sm:mb-12">
				<div class="mb-3 flex items-center justify-between">
					<span class="text-[10px] font-bold tracking-[0.2em] text-[#999] uppercase">Amount</span>
				</div>
				<div class="group relative flex flex-col gap-4 sm:block">
					<input
						type="number"
						bind:value={amount}
						min="0"
						step="0.01"
						class="h-16 w-full border-b-2 border-[#1a1a1a] bg-transparent font-mono text-4xl font-bold tabular-nums transition-colors outline-none placeholder:text-[#ddd] focus:border-[#e30613] sm:h-24 sm:text-6xl lg:h-32 lg:text-7xl"
						placeholder="0"
					/>
					<div class="flex items-center justify-between sm:absolute sm:right-0 sm:bottom-4">
						<p class="text-xs text-[#999] sm:hidden">{fromCurrencyInfo.name}</p>
						<select
							bind:value={fromCurrency}
							onchange={loadRates}
							class="h-10 cursor-pointer border-2 border-[#1a1a1a] bg-white px-3 pr-9 text-base font-bold transition-colors outline-none hover:border-[#e30613] focus:border-[#e30613] sm:mr-2 sm:h-12 sm:px-4 sm:pr-10 sm:text-lg"
						>
							{#each CURRENCIES as currency (currency.code)}
								<option value={currency.code}>{currency.code}</option>
							{/each}
						</select>
					</div>
				</div>
				<p class="mt-2 hidden text-xs text-[#999] sm:block">{fromCurrencyInfo.name}</p>
			</div>

			<!-- Swap Button -->
			<div class="my-6 flex items-center gap-4 sm:my-8">
				<div class="h-px flex-1 bg-[#ddd]"></div>
				<button
					onclick={swapCurrencies}
					class="group flex h-12 w-12 items-center justify-center bg-[#1a1a1a] text-white transition-all hover:bg-[#e30613] active:scale-95 sm:h-16 sm:w-16"
					aria-label="Swap currencies"
				>
					<svg
						class="h-5 w-5 transition-transform duration-300 group-hover:rotate-180 sm:h-6 sm:w-6"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M7 10h14l-4-4" />
						<path d="M17 14H3l4 4" />
					</svg>
				</button>
				<div class="h-px flex-1 bg-[#ddd]"></div>
			</div>

			<!-- Result -->
			<div class="mb-10 sm:mb-12">
				<div class="mb-3 flex items-center justify-between">
					<span class="text-[10px] font-bold tracking-[0.2em] text-[#999] uppercase"
						>Converted Amount</span
					>
					{#if loading}
						<span class="flex items-center gap-2 text-[10px] tracking-wider text-[#999] uppercase">
							<span class="h-2 w-2 animate-pulse bg-[#e30613]"></span>
							Updating
						</span>
					{/if}
				</div>
				<div class="group relative flex flex-col gap-4 sm:block">
					<div
						class="flex min-h-16 w-full items-center border-b-2 border-[#1a1a1a] font-mono text-4xl font-bold break-all text-[#e30613] tabular-nums sm:min-h-24 sm:text-6xl lg:min-h-32 lg:text-7xl"
					>
						{loading
							? '···'
							: convertedAmount.toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
					</div>
					<div class="flex items-center justify-between sm:absolute sm:right-0 sm:bottom-4">
						<p class="text-xs text-[#999] sm:hidden">{toCurrencyInfo.name}</p>
						<select
							bind:value={toCurrency}
							class="h-10 cursor-pointer border-2 border-[#1a1a1a] bg-white px-3 pr-9 text-base font-bold transition-colors outline-none hover:border-[#e30613] focus:border-[#e30613] sm:mr-2 sm:h-12 sm:px-4 sm:pr-10 sm:text-lg"
						>
							{#each CURRENCIES as currency (currency.code)}
								<option value={currency.code}>{currency.code}</option>
							{/each}
						</select>
					</div>
				</div>
				<p class="mt-2 hidden text-xs text-[#999] sm:block">{toCurrencyInfo.name}</p>
			</div>

			<!-- Rate Info Grid -->
			<div class="grid grid-cols-1 gap-6 border-t border-[#eee] pt-8 sm:grid-cols-2 sm:gap-8">
				<div>
					<span class="mb-2 block text-[10px] font-bold tracking-[0.2em] text-[#999] uppercase"
						>Rate</span
					>
					<span class="font-mono text-lg font-medium tabular-nums sm:text-xl">
						1 {fromCurrency} = {currentRate.toFixed(4)}
						{toCurrency}
					</span>
				</div>
				<div class="sm:text-right">
					<span class="mb-2 block text-[10px] font-bold tracking-[0.2em] text-[#999] uppercase"
						>Updated</span
					>
					<span class="font-mono text-sm text-[#666]">
						{lastUpdated
							? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
							: '—'}
					</span>
				</div>
			</div>
		</section>

		<!-- Reference Rates Sidebar -->
		<aside class="col-span-12 bg-[#fafafa] lg:col-span-5">
			<div class="p-5 sm:p-8 lg:p-12">
				<!-- Info Card -->
				<div class="mb-8 border border-[#e5e5e5] bg-white p-4 sm:p-5">
					<div class="flex items-start gap-4">
						<div class="h-full min-h-[2rem] w-1 shrink-0 bg-[#e30613] sm:min-h-[2.5rem]"></div>
						<div>
							<p class="text-[11px] leading-relaxed text-[#666] sm:text-xs">
								Rates are updated every 5 minutes via Frankfurter API. No account or API key
								required.
							</p>
						</div>
					</div>
				</div>

				<div class="mb-6 flex items-center gap-3 sm:mb-8">
					<div class="h-[2px] w-6 bg-[#1a1a1a] sm:w-8"></div>
					<h2 class="text-[10px] font-bold tracking-[0.25em] uppercase sm:text-xs">
						Reference Rates
					</h2>
				</div>

				<div class="space-y-0">
					{#each ['USD', 'EUR', 'SGD', 'GBP', 'JPY', 'AUD'] as code (code)}
						{@const currency = CURRENCIES.find((c) => c.code === code)}
						{@const rate = rates?.rates[code]}
						{#if rate && currency}
							<div
								class="group flex items-center justify-between border-b border-[#e5e5e5] py-4 transition-colors hover:border-[#1a1a1a] sm:py-5"
							>
								<div class="flex items-center gap-3 sm:gap-4">
									<span class="text-2xl transition-transform group-hover:scale-110 sm:text-3xl"
										>{currency.flag}</span
									>
									<div>
										<span class="block text-sm font-bold sm:text-base">{code}</span>
										<span class="block text-[9px] tracking-wider text-[#999] uppercase sm:text-[10px]"
											>{currency.name}</span
										>
									</div>
								</div>
								<div class="text-right">
									<span class="block font-mono text-lg font-medium tabular-nums sm:text-xl"
										>{rate.toFixed(4)}</span
									>
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
			<div class="col-span-12 p-5 sm:p-6 lg:col-span-7 lg:p-8">
				<span class="text-[10px] tracking-[0.2em] text-[#999] uppercase">
					Data: <a
						href="https://frankfurter.app"
						target="_blank"
						rel="noopener"
						class="underline transition-colors hover:text-[#e30613]">Frankfurter</a
					>
				</span>
			</div>
			<div
				class="col-span-12 flex border-t border-[#1a1a1a] p-5 sm:p-6 lg:col-span-5 lg:justify-end lg:border-t-0 lg:border-l lg:p-8"
			>
				<span class="text-[10px] tracking-[0.2em] text-[#999] uppercase">
					{new Date().getFullYear()}
				</span>
			</div>
		</div>
	</footer>
</div>
