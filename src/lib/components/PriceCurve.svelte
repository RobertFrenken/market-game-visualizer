<script lang="ts">
  import { formatNumber } from '../market/rules';
  import type { HourState } from '../market/simulator';

  interface Props {
    states: HourState[];
    hour: number;
  }

  let { states, hour }: Props = $props();

  const chart = {
    width: 540,
    height: 150,
    padding: 22,
  };

  let priceValues = $derived(states.flatMap((state) => [state.price, state.nextPrice]));
  let maxPrice = $derived(Math.max(...priceValues, 0.5));
  let points = $derived(
    states
      .map((state, index) => {
        const x = chart.padding + (index / (states.length - 1)) * (chart.width - chart.padding * 2);
        const y =
          chart.height -
          chart.padding -
          (state.price / maxPrice) * (chart.height - chart.padding * 2);
        return `${x},${y}`;
      })
      .join(' '),
  );
  let markerX = $derived(
    chart.padding + (hour / (states.length - 1)) * (chart.width - chart.padding * 2),
  );
  let markerY = $derived(
    chart.height -
      chart.padding -
      (states[hour].price / maxPrice) * (chart.height - chart.padding * 2),
  );
</script>

<section class="curve" aria-label="Price curve">
  <div class="curve-header">
    <h2>Price over time</h2>
    <span>Hour {hour}: ${formatNumber(states[hour].price, 3)}/kWh</span>
  </div>
  <svg
    viewBox={`0 0 ${chart.width} ${chart.height}`}
    role="img"
    aria-label="Line chart of hourly prices"
  >
    <line
      x1={chart.padding}
      y1={chart.height - chart.padding}
      x2={chart.width - chart.padding}
      y2={chart.height - chart.padding}
      class="axis"
    />
    <line
      x1={chart.padding}
      y1={chart.padding}
      x2={chart.padding}
      y2={chart.height - chart.padding}
      class="axis"
    />
    <polyline points={points} class="line" />
    <line
      x1={markerX}
      y1={chart.padding}
      x2={markerX}
      y2={chart.height - chart.padding}
      class="marker-line"
    />
    <circle cx={markerX} cy={markerY} r="5" class="marker" />
  </svg>
</section>

<style>
  .curve {
    display: grid;
    gap: 8px;
  }

  .curve-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }

  h2 {
    margin: 0;
    font-size: 15px;
    color: #172033;
  }

  span {
    color: #596579;
    font-size: 12px;
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
    border: 1px solid #d7dce5;
    border-radius: 6px;
    background: #ffffff;
  }

  .axis {
    stroke: #c9d1dc;
    stroke-width: 1;
  }

  .line {
    fill: none;
    stroke: #355c7d;
    stroke-width: 3;
  }

  .marker-line {
    stroke: #b7791f;
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }

  .marker {
    fill: #b7791f;
    stroke: #ffffff;
    stroke-width: 2;
  }
</style>
