<script lang="ts">
  import { BaseEdge, EdgeLabel, getSmoothStepPath } from '@xyflow/svelte';
  import { ArrowDownLeft, ArrowUpRight } from '@lucide/svelte';
  import type { EdgeProps } from '@xyflow/svelte';

  import type { SignalEdge } from '../flow/graph';

  type Props = EdgeProps<SignalEdge>;

  let {
    id,
    data,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  }: Props = $props();

  const edgeStyles = {
    price: 'stroke: #2f6f9f; stroke-width: 3;',
    demand: 'stroke: #8a5a12; stroke-width: 3;',
  };

  let [path, labelX, labelY] = $derived(
    getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    }),
  );
  let kind = $derived(data?.kind ?? 'price');
  let label = $derived(data?.label ?? '');
  let Icon = $derived(kind === 'price' ? ArrowUpRight : ArrowDownLeft);
  let edgeClass = $derived(data?.active ? '' : 'inactive');
</script>

<BaseEdge id={id} {path} style={edgeStyles[kind]} class={edgeClass} />

<EdgeLabel x={labelX} y={labelY}>
  <div class={`edge-badge ${kind}`} class:inactive={!data?.active}>
    <Icon size={13} />
    <span>{label}</span>
  </div>
</EdgeLabel>

<style>
  :global(.svelte-flow__edge.inactive path) {
    opacity: 0.42;
  }

  .edge-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px solid #c9d1dc;
    border-radius: 999px;
    padding: 4px 8px;
    background: #ffffff;
    color: #172033;
    box-shadow: 0 6px 16px rgba(36, 48, 66, 0.14);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;
  }

  .edge-badge.price {
    border-color: #a8c7dd;
    color: #245d84;
  }

  .edge-badge.demand {
    border-color: #d8bd8d;
    color: #8a5a12;
  }

  .edge-badge.inactive {
    opacity: 0.55;
  }
</style>
