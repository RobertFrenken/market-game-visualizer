<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import { Activity, BadgeDollarSign, Calculator } from '@lucide/svelte';

  import { formatEnergy, formatPrice } from '../format/display';
  import type { MarketNodeData } from '../flow/graph';

  interface Props {
    data: MarketNodeData;
    selected?: boolean;
  }

  let { data, selected = false }: Props = $props();
</script>

<article class:active={data.active} class:selected class="market-node">
  <Handle type="source" position={Position.Right} />
  <Handle type="target" position={Position.Right} />

  <header>
    <div>
      <span>Market maker</span>
      <h3>Hour {data.hour}</h3>
    </div>
    <div class="node-icon">
      <Calculator size={20} />
    </div>
  </header>

  <section class="price-grid">
    <div>
      <div class="metric-icon">
        <BadgeDollarSign size={16} />
      </div>
      <span>Current</span>
      <strong>{formatPrice(data.price)}</strong>
    </div>
    <div>
      <div class="metric-icon">
        <Activity size={16} />
      </div>
      <span>Next</span>
      <strong>{formatPrice(data.nextPrice)}</strong>
    </div>
  </section>

  <dl>
    <div>
      <dt>Total load</dt>
      <dd>{formatEnergy(data.totalMarketLoad)}</dd>
    </div>
    <div>
      <dt>Average load</dt>
      <dd>{formatEnergy(data.averageMarketLoad)}</dd>
    </div>
  </dl>
</article>

<style>
  .market-node {
    width: 300px;
    border: 2px solid #355c7d;
    border-radius: 8px;
    padding: 13px;
    background: #f7fbff;
    color: #122536;
    box-shadow: 0 10px 26px rgba(36, 48, 66, 0.14);
    transition:
      border-color 140ms ease,
      box-shadow 140ms ease;
  }

  .market-node.active {
    border-color: #b7791f;
    box-shadow: 0 12px 30px rgba(183, 121, 31, 0.25);
  }

  .market-node.selected {
    outline: 3px solid rgba(47, 111, 159, 0.22);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  h3 {
    margin: 2px 0 0;
    font-size: 18px;
    letter-spacing: 0;
  }

  span,
  dt {
    color: #596579;
    font-size: 11px;
  }

  .price-grid,
  dl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .price-grid {
    margin-top: 12px;
  }

  .price-grid div,
  dl div {
    min-width: 0;
    border: 1px solid #c9d8e5;
    border-radius: 6px;
    padding: 8px;
    background: #ffffff;
  }

  .node-icon,
  .metric-icon {
    color: #2f6f9f;
  }

  strong,
  dd {
    display: block;
    margin: 3px 0 0;
    font-size: 13px;
    font-weight: 800;
  }

  dl {
    margin: 8px 0 0;
  }

  dt,
  dd {
    margin: 0;
  }

  :global(.svelte-flow__handle) {
    width: 8px;
    height: 8px;
    border-color: #ffffff;
    background: #355c7d;
  }
</style>
