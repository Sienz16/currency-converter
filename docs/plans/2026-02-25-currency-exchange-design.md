# Currency Exchange Website Design

## Overview
A modern fintech-style currency exchange website built with SvelteKit, featuring real-time exchange rates.

## Visual Direction: Modern Fintech

### Color Palette
- **Background**: Deep navy/slate (#0f172a, #1e293b)
- **Accent**: Teal/cyan gradients (#06b6d4, #14b8a6) — conveys trust and financial stability
- **Text**: White/light gray for primary, muted gray for secondary
- **Cards**: Slightly lighter than background with subtle borders

### Typography
- Clean sans-serif system
- Tabular figures for numbers (clean alignment)
- Clear hierarchy: Large display for amounts, smaller for labels

### Layout
- Hero card-based converter as the focal point
- Supporting rate information below
- Centered, max-width container for readability

### Interactions
- Smooth number transitions
- Subtle hover states on interactive elements
- Real-time calculation as user types
- Swap animation when reversing currencies

## Features

### Core
- Amount input with currency selection
- Real-time conversion display
- Swap button to reverse currencies (MYR ↔ IDR)
- Current exchange rate display
- Last updated timestamp

### Additional
- Popular exchange rates table
- Rate change indicators (up/down)
- Loading states for API calls
- Error handling with user-friendly messages

## Architecture

### Tech Stack
- Svelte 5 with runes ($state, $effect)
- Tailwind CSS v4 for styling
- Frankfurter.app API for live rates

### Data Flow
1. On mount: Fetch latest rates with MYR as base currency
2. User types amount → instant calculation using cached rates
3. Currency change → fetch new rates if base currency changes
4. Swap button → reverse currencies and trigger recalculation

### State Management
- `amount`: Input amount (default: 1)
- `fromCurrency`: Source currency (default: 'MYR')
- `toCurrency`: Target currency (default: 'IDR')
- `rates`: Cached exchange rates object
- `loading`: API call status
- `error`: Error message if API fails
- `lastUpdated`: Timestamp of last successful fetch

### API Strategy
- Primary: frankfurter.app (free, no API key needed)
- Cache rates for 5 minutes to minimize requests
- Fallback to user-friendly error message on failure

## Defaults
- From: MYR (Malaysian Ringgit)
- To: IDR (Indonesian Rupiah)
- Initial amount: 1

## Responsive Behavior
- Mobile: Stacked layout, full-width inputs
- Tablet+: Side-by-side inputs with swap button between
- Large screens: Centered card with max-width constraint
