<script lang="ts">
  import { BatteryCharging, CircleDollarSign, Home, Landmark } from '@lucide/svelte';

  import { formatCost, formatEnergy, formatPrice } from '../format/display';
  import type { FlowNodeData } from '../flow/graph';
  import { formatNumber } from '../market/rules';

  interface Props {
    data: FlowNodeData;
  }

  let { data }: Props = $props();
</script>

<section class="inspector" aria-label="Selected node details">
  <header>
    {#if data.kind === 'market'}
      <div class="header-icon">
        <Landmark size={18} />
      </div>
      <div>
        <span>Selected market</span>
        <h2>Market Maker</h2>
      </div>
    {:else}
      <div class="header-icon">
        <Home size={18} />
      </div>
      <div>
        <span>Selected house</span>
        <h2>{data.name}</h2>
      </div>
    {/if}
  </header>

  {#if data.kind === 'market'}
    <dl>
      <div><dt>Hour</dt><dd>{data.hour}</dd></div>
      <div><dt>Current price</dt><dd>{formatPrice(data.price)}</dd></div>
      <div><dt>Next price</dt><dd>{formatPrice(data.nextPrice)}</dd></div>
      <div><dt>Total load</dt><dd>{formatEnergy(data.totalMarketLoad)}</dd></div>
      <div><dt>Average load</dt><dd>{formatEnergy(data.averageMarketLoad)}</dd></div>
    </dl>
    <section class="calculation" aria-label="Market calculation">
      <h3>Calculation</h3>
      <div>
        <code>average_load = total_load / houses</code>
        <span>
          {formatEnergy(data.averageMarketLoad)} = {formatEnergy(data.totalMarketLoad)} / {data.houseCount}
        </span>
      </div>
      <div>
        <code>next_price = price_rule(average_load)</code>
        <span>{formatPrice(data.nextPrice)} from {formatEnergy(data.averageMarketLoad)}</span>
      </div>
    </section>
  {:else}
    <div class="summary">
      <div>
        <span class="summary-icon">
          <BatteryCharging size={17} />
        </span>
        <span>{formatEnergy(data.batteryBefore)} to {formatEnergy(data.batteryAfter)}</span>
      </div>
      <div>
        <span class="summary-icon">
          <CircleDollarSign size={17} />
        </span>
        <span>{formatCost(data.cost)} at {formatPrice(data.price)}</span>
      </div>
    </div>
    <dl>
      <div><dt>Policy</dt><dd>{data.policy}</dd></div>
      <div><dt>Action</dt><dd>{data.actionLabel}</dd></div>
      <div><dt>Base demand</dt><dd>{formatEnergy(data.baseDemand)}</dd></div>
      <div><dt>Market load</dt><dd>{formatEnergy(data.marketLoad)}</dd></div>
      <div><dt>Proposed load</dt><dd>{formatEnergy(data.proposedLoad)}</dd></div>
      <div><dt>Battery before</dt><dd>{formatEnergy(data.batteryBefore)}</dd></div>
      <div><dt>Battery after</dt><dd>{formatEnergy(data.batteryAfter)}</dd></div>
    </dl>
    <section class="calculation" aria-label="House calculation">
      <h3>Calculation</h3>
      <div>
        <code>proposed_load = base_demand + battery_delta</code>
        <span>
          {formatEnergy(data.proposedLoad)} = {formatEnergy(data.baseDemand)} +
          {formatEnergy(data.batteryDelta)}
        </span>
      </div>
      <div>
        <code>market_load = clamp(proposed_load)</code>
        <span>{formatEnergy(data.marketLoad)}{data.warning ? `, ${data.warning}` : ''}</span>
      </div>
      <div>
        <code>cost = price * market_load</code>
        <span>
          {formatCost(data.cost)} = {formatPrice(data.price)} * {formatNumber(data.marketLoad)}
        </span>
      </div>
      <div>
        <code>policy_reason</code>
        <span>{data.decisionReason}</span>
      </div>
    </section>
    {#if data.warning}
      <p>{data.warning}</p>
    {/if}
  {/if}
</section>

<style>
  .inspector {
    display: grid;
    gap: 12px;
    border: 1px solid #d7dce5;
    border-radius: 6px;
    padding: 12px;
    background: #ffffff;
  }

  header,
  .summary div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-icon {
    color: #355c7d;
  }

  h2 {
    margin: 1px 0 0;
    font-size: 15px;
    letter-spacing: 0;
  }

  span,
  dt {
    color: #596579;
    font-size: 12px;
  }

  .summary {
    display: grid;
    gap: 6px;
  }

  .summary-icon {
    color: #b7791f;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 0;
  }

  dl div {
    min-width: 0;
    border: 1px solid #e2e6ed;
    border-radius: 6px;
    padding: 8px;
    background: #f8fafc;
  }

  dt,
  dd {
    margin: 0;
  }

  dd {
    margin-top: 2px;
    color: #172033;
    font-size: 13px;
    font-weight: 700;
  }

  .calculation {
    display: grid;
    gap: 8px;
    border: 1px solid #e2e6ed;
    border-radius: 6px;
    padding: 10px;
    background: #fbfcfe;
  }

  .calculation h3 {
    margin: 0;
    color: #172033;
    font-size: 13px;
    letter-spacing: 0;
  }

  .calculation div {
    display: grid;
    gap: 3px;
  }

  code {
    color: #334155;
    font-size: 12px;
  }

  .calculation span {
    color: #596579;
    font-size: 12px;
    line-height: 1.35;
  }

  p {
    margin: 0;
    color: #92400e;
    font-size: 12px;
    line-height: 1.35;
  }
</style>
