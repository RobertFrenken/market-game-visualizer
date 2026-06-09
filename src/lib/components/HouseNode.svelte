<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import { ArrowDown, ArrowRight, ArrowUp, Battery, Zap } from '@lucide/svelte';

  import { formatCost, formatEnergy, formatPercent, formatPrice } from '../format/display';
  import { BATTERY_CAPACITY } from '../market/rules';
  import type { HouseNodeData } from '../flow/graph';

  interface Props {
    data: HouseNodeData;
    selected?: boolean;
  }

  let { data, selected = false }: Props = $props();

  let batteryRatio = $derived(Math.max(0, Math.min(1, data.batteryAfter / BATTERY_CAPACITY)));
  let batteryChange = $derived(data.batteryAfter - data.batteryBefore);
  let actionClass = $derived(data.actionLabel.replace(' ', '-'));
  let ActionIcon = $derived(
    data.actionLabel === 'charge' ? ArrowUp : data.actionLabel === 'discharge' ? ArrowDown : ArrowRight,
  );
</script>

<article class:active={data.active} class:selected class:warning={Boolean(data.warning)} class="house-node">
  <Handle type="target" position={Position.Left} />
  <Handle type="source" position={Position.Left} />

  <header>
    <div>
      <span>{data.policy}</span>
      <h3>{data.name}</h3>
    </div>
    <div class={`action ${actionClass}`} aria-label={`Battery action: ${data.actionLabel}`}>
      <ActionIcon size={15} />
    </div>
  </header>

  <section class="battery-row" aria-label={`Battery charge ${formatPercent(batteryRatio)}`}>
    <Battery size={18} />
    <div class="battery-track">
      <div class="battery-fill" style={`width: ${batteryRatio * 100}%`}></div>
    </div>
    <strong>{formatPercent(batteryRatio)}</strong>
  </section>

  <dl>
    <div>
      <dt>Base</dt>
      <dd>{formatEnergy(data.baseDemand)}</dd>
    </div>
    <div>
      <dt>Market</dt>
      <dd>{formatEnergy(data.marketLoad)}</dd>
    </div>
    <div>
      <dt>Battery</dt>
      <dd>{batteryChange >= 0 ? '+' : ''}{formatEnergy(batteryChange)}</dd>
    </div>
    <div>
      <dt>Cost</dt>
      <dd>{formatCost(data.cost)}</dd>
    </div>
  </dl>

  <footer>
    <Zap size={14} />
    <span>reads {formatPrice(data.price)}</span>
  </footer>

  {#if data.warning}
    <p class="warning-text">{data.warning}</p>
  {/if}
</article>

<style>
  .house-node {
    width: 270px;
    border: 1px solid #cfd6df;
    border-radius: 8px;
    padding: 12px;
    background: #ffffff;
    color: #172033;
    box-shadow: 0 10px 26px rgba(36, 48, 66, 0.12);
    transition:
      border-color 140ms ease,
      box-shadow 140ms ease,
      transform 140ms ease;
  }

  .house-node.active {
    border-color: #2f6f9f;
    box-shadow: 0 12px 30px rgba(47, 111, 159, 0.22);
  }

  .house-node.selected {
    outline: 3px solid rgba(183, 121, 31, 0.24);
  }

  .house-node.warning {
    border-color: #b45309;
  }

  header,
  .battery-row,
  footer {
    display: flex;
    align-items: center;
  }

  header {
    justify-content: space-between;
    gap: 12px;
  }

  h3 {
    margin: 2px 0 0;
    font-size: 15px;
    line-height: 1.2;
    letter-spacing: 0;
  }

  span,
  dt,
  footer {
    color: #596579;
    font-size: 11px;
  }

  .action {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    background: #eef2f7;
    color: #334155;
  }

  .action.charge {
    background: #e4f3ea;
    color: #147344;
  }

  .action.discharge {
    background: #f8ead9;
    color: #9a5b0f;
  }

  .battery-row {
    gap: 8px;
    margin-top: 12px;
  }

  .battery-track {
    height: 9px;
    flex: 1;
    overflow: hidden;
    border-radius: 999px;
    background: #e2e8f0;
  }

  .battery-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2f6f9f, #43a477);
  }

  .battery-row strong {
    min-width: 34px;
    text-align: right;
    font-size: 12px;
  }

  dl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 12px 0 0;
  }

  dl div {
    min-width: 0;
    border: 1px solid #e1e6ee;
    border-radius: 6px;
    padding: 7px 8px;
    background: #f8fafc;
  }

  dt,
  dd {
    margin: 0;
  }

  dd {
    margin-top: 2px;
    font-size: 13px;
    font-weight: 700;
  }

  footer {
    gap: 6px;
    margin-top: 10px;
  }

  .warning-text {
    margin: 8px 0 0;
    color: #92400e;
    font-size: 12px;
    line-height: 1.3;
  }

  :global(.svelte-flow__handle) {
    width: 8px;
    height: 8px;
    border-color: #ffffff;
    background: #355c7d;
  }
</style>
