import { Position, type Edge, type Node } from '@xyflow/svelte';
import { formatNumber } from '../market/rules';
import type { HourState } from '../market/simulator';

export type Phase = 'price' | 'decide' | 'submit' | 'aggregate';

export const PHASES: Phase[] = ['price', 'decide', 'submit', 'aggregate'];

const HOUSE_POSITIONS = [
  { x: 455, y: 40 },
  { x: 455, y: 260 },
  { x: 455, y: 480 },
  { x: 455, y: 700 },
  { x: 455, y: 920 },
];

function houseNodeLabel(house: HourState['houses'][number], phase: Phase): string {
  const active = phase === 'decide' || phase === 'submit';
  const prefix = active ? '● ' : '';
  return [
    `${prefix}${house.name}`,
    `policy: ${house.policy}`,
    `reads: $${formatNumber(house.cost / house.marketLoad || 0, 3)}/kWh`,
    `base: ${formatNumber(house.baseDemand)} kWh`,
    `battery: ${formatNumber(house.batteryBefore)} -> ${formatNumber(house.batteryAfter)} kWh`,
    `action: ${house.actionLabel}`,
    `publishes: ${formatNumber(house.marketLoad)} kWh`,
    `cost: $${formatNumber(house.cost, 3)}`,
  ].join('\n');
}

function marketLabel(state: HourState, phase: Phase): string {
  const active = phase === 'price' || phase === 'aggregate';
  const prefix = active ? '● ' : '';
  return [
    `${prefix}Market Maker`,
    `hour: ${state.hour}`,
    `price read by houses: $${formatNumber(state.price, 3)}/kWh`,
    `total demand: ${formatNumber(state.totalMarketLoad)} kWh`,
    `average demand: ${formatNumber(state.averageMarketLoad)} kWh`,
    `next price: $${formatNumber(state.nextPrice, 3)}/kWh`,
  ].join('\n');
}

export function graphForHour(state: HourState, phase: Phase): { nodes: Node[]; edges: Edge[] } {
  const marketNode: Node = {
    id: 'market',
    type: 'default',
    position: { x: 70, y: 260 },
    targetPosition: Position.Right,
    sourcePosition: Position.Right,
    data: { label: marketLabel(state, phase) },
    style:
      'white-space: pre-line; width: 270px; border: 2px solid #355c7d; background: #f4fbff; color: #122536; border-radius: 8px; padding: 12px; font-size: 13px;',
  };

  const houseNodes: Node[] = state.houses.map((house, index) => ({
    id: house.id,
    type: 'default',
    position: HOUSE_POSITIONS[index] ?? { x: 40, y: 50 + index * 215 },
    targetPosition: Position.Left,
    sourcePosition: Position.Left,
    data: { label: houseNodeLabel(house, phase) },
    style:
      'white-space: pre-line; width: 240px; border: 1px solid #7a8f4a; background: #fbfff4; color: #22310f; border-radius: 8px; padding: 12px; font-size: 13px;',
  }));

  const priceEdges: Edge[] = state.houses.map((house) => ({
    id: `price-${house.id}`,
    type: 'smoothstep',
    source: 'market',
    target: house.id,
    animated: true,
    label: `read price $${formatNumber(state.price, 3)}`,
    style: 'stroke: #2f6f9f; stroke-width: 3;',
  }));

  const demandEdges: Edge[] = state.houses.map((house) => ({
    id: `demand-${house.id}`,
    type: 'smoothstep',
    source: house.id,
    target: 'market',
    animated: true,
    label: `publish ${formatNumber(house.marketLoad)} kWh`,
    style: 'stroke: #8a5a12; stroke-width: 3;',
  }));

  const edgesByPhase: Record<Phase, Edge[]> = {
    price: priceEdges,
    decide: [],
    submit: demandEdges,
    aggregate: [],
  };

  return {
    nodes: [marketNode, ...houseNodes],
    edges: edgesByPhase[phase],
  };
}

export function phaseLabel(phase: Phase): string {
  if (phase === 'price') return 'Market publishes current price';
  if (phase === 'decide') return 'House policies choose battery actions';
  if (phase === 'submit') return 'Houses submit market loads';
  return 'Market aggregates and computes next price';
}
