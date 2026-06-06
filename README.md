# Market Game Visualizer

Standalone Svelte Flow app for explaining the HELICS market game interaction
model. The app is intentionally separate from `HELICS-Examples-market_game` and
has no HELICS or RL runtime dependency.

## What It Shows

- House agents arranged around a market maker node.
- Market-to-house price publications.
- House-to-market demand submissions.
- Hour-by-hour battery, cost, load, and price changes.
- A timeline with explicit phases:
  - market publishes price
  - houses choose actions
  - houses submit market loads
  - market aggregates and computes next price

## Commands

```bash
npm install
npm run dev
npm run check
npm run build
```

## Implementation

- `src/lib/market`: pure TypeScript market rules and deterministic simulation.
- `src/lib/flow`: maps simulation state to Svelte Flow nodes and edges.
- `src/lib/components`: timeline controls, metrics table, and price chart.

The market rules mirror the Python shared-core model:

```text
market_load = base_demand + battery_delta
effective_load = clamp(market_load)
hour_cost = current_price * effective_load
next_price = price_rule(average_effective_load)
```

The default scenario uses three built-in house policies:

- follow demand
- flatten demand
- price aware
