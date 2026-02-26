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
			<div class="col-span-12 p-8 lg:col-span-7 lg:p-12 lg:pb-16">
				<div class="flex items-start gap-6">
					<div class="h-20 w-1 shrink-0 bg-[#e30613]"></div>
					<div>
						<p class="mb-3 text-[11px] tracking-[0.3em] text-[#666] uppercase">Foreign Exchange</p>
						<h1 class="text-5xl leading-[0.9] font-bold tracking-tight uppercase lg:text-7xl">
							Currency<br />Exchange
						</h1>
					</div>
				</div>
			</div>
			<div
				class="col-span-12 flex flex-col justify-end border-t-2 border-[#1a1a1a] p-8 lg:col-span-5 lg:border-t-0 lg:border-l-2 lg:p-12 lg:pb-16"
			>
				<p class="text-xs tracking-[0.2em] text-[#666] uppercase">
					Real-time rates via Frankfurter API
				</p>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="grid flex-1 grid-cols-12">
		<!-- Converter Section -->
		<section
			class="col-span-12 border-b-2 border-[#1a1a1a] p-8 lg:col-span-7 lg:border-r-2 lg:border-b-0 lg:p-12"
		>
			<!-- Error -->
			{#if error}
				<div class="mb-10 border-l-4 border-[#e30613] bg-[#fff5f5] p-5">
					<p class="text-sm font-medium text-[#e30613]">{error}</p>
				</div>
			{/if}

			<!-- Amount Input -->
			<div class="mb-12">
				<div class="mb-3 flex items-center justify-between">
					<span class="text-[10px] font-bold tracking-[0.2em] text-[#999] uppercase">Amount</span>
				</div>
				<div class="relative">
					<input
						type="number"
						bind:value={amount}
						min="0"
						step="0.01"
						class="h-24 w-full border-b-2 border-[#1a1a1a] bg-transparent font-mono text-6xl font-bold tabular-nums transition-colors outline-none placeholder:text-[#ddd] focus:border-[#e30613] lg:h-32 lg:text-7xl"
						placeholder="0"
					/>
					<div class="absolute right-0 bottom-4">
						<select
							bind:value={fromCurrency}
							onchange={loadRates}
							class="mr-2 h-12 cursor-pointer border-2 border-[#1a1a1a] bg-white px-4 pr-10 text-lg font-bold transition-colors outline-none hover:border-[#e30613] focus:border-[#e30613]"
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
			<div class="my-8 flex items-center gap-4">
				<div class="h-px flex-1 bg-[#ddd]"></div>
				<button
					onclick={swapCurrencies}
					class="group flex h-16 w-16 items-center justify-center bg-[#1a1a1a] text-white transition-all hover:bg-[#e30613] active:scale-95"
					aria-label="Swap currencies"
				>
					<svg
						class="transition-transform duration-300 group-hover:rotate-180"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
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
			<div class="mb-12">
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
				<div class="relative">
					<div
						class="flex min-h-24 w-full items-center border-b-2 border-[#1a1a1a] font-mono text-6xl font-bold break-all text-[#e30613] tabular-nums lg:min-h-32 lg:text-7xl"
					>
						{loading
							? '···'
							: convertedAmount.toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
					</div>
					<div class="absolute right-0 bottom-4">
						<select
							bind:value={toCurrency}
							class="mr-2 h-12 cursor-pointer border-2 border-[#1a1a1a] bg-white px-4 pr-10 text-lg font-bold transition-colors outline-none hover:border-[#e30613] focus:border-[#e30613]"
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
			<div class="grid grid-cols-2 gap-8 border-t border-[#eee] pt-8">
				<div>
					<span class="mb-2 block text-[10px] font-bold tracking-[0.2em] text-[#999] uppercase"
						>Rate</span
					>
					<span class="font-mono text-xl font-medium tabular-nums">
						1 {fromCurrency} = {currentRate.toFixed(4)}
						{toCurrency}
					</span>
				</div>
				<div class="text-right">
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
			<div class="p-8 lg:p-12">
				<!-- Info Card -->
				<div class="mb-8 border border-[#e5e5e5] bg-white p-5">
					<div class="flex items-start gap-4">
						<div class="h-full min-h-[2.5rem] w-1 shrink-0 bg-[#e30613]"></div>
						<div>
							<p class="text-xs leading-relaxed text-[#666]">
								Rates are updated every 5 minutes via Frankfurter API.
							</p>
						</div>
					</div>
				</div>

				<div class="mb-8 flex items-center gap-3">
					<div class="h-[2px] w-8 bg-[#1a1a1a]"></div>
					<h2 class="text-xs font-bold tracking-[0.25em] uppercase">Reference Rates</h2>
				</div>

				<div class="space-y-0">
					{#each ['USD', 'EUR', 'SGD', 'GBP', 'JPY', 'AUD'] as code (code)}
						{@const currency = CURRENCIES.find((c) => c.code === code)}
						{@const rate = rates?.rates[code]}
						{#if rate && currency}
							<div
								class="group flex items-center justify-between border-b border-[#e5e5e5] py-5 transition-colors hover:border-[#1a1a1a]"
							>
								<div class="flex items-center gap-4">
									<span class="text-3xl transition-transform group-hover:scale-110"
										>{currency.flag}</span
									>
									<div>
										<span class="block text-base font-bold">{code}</span>
										<span class="block text-[10px] tracking-wider text-[#999] uppercase"
											>{currency.name}</span
										>
									</div>
								</div>
								<div class="text-right">
									<span class="block font-mono text-xl font-medium tabular-nums"
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
			<div class="col-span-12 p-6 lg:col-span-7 lg:p-8">
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
				class="col-span-12 flex border-t border-[#1a1a1a] p-6 lg:col-span-5 lg:justify-end lg:border-t-0 lg:border-l lg:p-8"
			>
				<span class="text-[10px] tracking-[0.2em] text-[#999] uppercase">
					{new Date().getFullYear()}
				</span>
			</div>
		</div>
	</footer>
</div>
