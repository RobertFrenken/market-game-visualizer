<script lang="ts">
  import { formatNumber } from '../market/rules';
  import type { HourState } from '../market/simulator';

  interface Props {
    state: HourState;
  }

  let { state }: Props = $props();
</script>

<section class="metrics" aria-label="Market metrics">
  <div class="summary-grid">
    <div>
      <span>Current price</span>
      <strong>${formatNumber(state.price, 3)}</strong>
    </div>
    <div>
      <span>Next price</span>
      <strong>${formatNumber(state.nextPrice, 3)}</strong>
    </div>
    <div>
      <span>Total load</span>
      <strong>{formatNumber(state.totalMarketLoad)} kWh</strong>
    </div>
    <div>
      <span>Average load</span>
      <strong>{formatNumber(state.averageMarketLoad)} kWh</strong>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>House</th>
        <th>Action</th>
        <th>Base</th>
        <th>Market</th>
        <th>Battery</th>
        <th>Cost</th>
      </tr>
    </thead>
    <tbody>
      {#each state.houses as house}
        <tr>
          <td>{house.name}</td>
          <td>{house.actionLabel}</td>
          <td>{formatNumber(house.baseDemand)}</td>
          <td>{formatNumber(house.marketLoad)}</td>
          <td>{formatNumber(house.batteryAfter)}</td>
          <td>${formatNumber(house.cost, 3)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  .metrics {
    display: grid;
    gap: 14px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .summary-grid div {
    border: 1px solid #d7dce5;
    border-radius: 6px;
    padding: 10px;
    background: #ffffff;
  }

  span {
    display: block;
    color: #596579;
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 2px;
    color: #172033;
    font-size: 18px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  th,
  td {
    text-align: left;
    padding: 8px 6px;
    border-bottom: 1px solid #e2e6ed;
  }

  th {
    color: #596579;
    font-size: 12px;
    font-weight: 700;
  }

  td {
    color: #172033;
  }
</style>
