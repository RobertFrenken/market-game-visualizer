import { Position, type Edge, type Node } from '@xyflow/svelte';
import { formatEnergy, formatPrice } from '../format/display';
import type { PolicyKind } from '../market/rules';
import type { HourState } from '../market/simulator';

export type Phase = 'price' | 'decide' | 'submit' | 'aggregate';

export const PHASES: Phase[] = ['price', 'decide', 'submit', 'aggregate'];

const PHASE_LABELS: Record<Phase, string> = {
  price: 'Market publishes current price',
  decide: 'House policies choose battery actions',
  submit: 'Houses submit market loads',
  aggregate: 'Market aggregates and computes next price',
};

export type MarketNodeData = {
  kind: 'market';
  active: boolean;
  hour: number;
  price: number;
  nextPrice: number;
  totalMarketLoad: number;
  averageMarketLoad: number;
  houseCount: number;
};

export type HouseNodeData = {
  kind: 'house';
  active: boolean;
  id: string;
  name: string;
  policy: PolicyKind;
  actionLabel: string;
  baseDemand: number;
  proposedLoad: number;
  marketLoad: number;
  batteryBefore: number;
  batteryAfter: number;
  cost: number;
  price: number;
  batteryDelta: number;
  warning: string;
  decisionReason: string;
};

export type FlowNodeData = MarketNodeData | HouseNodeData;
export type FlowNode = Node<FlowNodeData, 'market' | 'house'>;

export type SignalEdgeData = {
  kind: 'price' | 'demand';
  label: string;
  phase: Phase;
  active: boolean;
};

export type SignalEdge = Edge<SignalEdgeData, 'signal'>;

const HOUSE_POSITIONS = [
  { x: 500, y: 20 },
  { x: 500, y: 260 },
  { x: 500, y: 500 },
  { x: 500, y: 740 },
  { x: 500, y: 980 },
];

export function graphForHour(
  state: HourState,
  phase: Phase,
  selectedNodeId = 'market',
): { nodes: FlowNode[]; edges: SignalEdge[] } {
  const marketNode: FlowNode = {
    id: 'market',
    type: 'market',
    position: { x: 70, y: 260 },
    targetPosition: Position.Right,
    sourcePosition: Position.Right,
    selected: selectedNodeId === 'market',
    data: {
      kind: 'market',
      active: phase === 'price' || phase === 'aggregate',
      hour: state.hour,
      price: state.price,
      nextPrice: state.nextPrice,
      totalMarketLoad: state.totalMarketLoad,
      averageMarketLoad: state.averageMarketLoad,
      houseCount: state.houses.length,
    },
  };

  const houseNodes: FlowNode[] = state.houses.map((house, index) => ({
    id: house.id,
    type: 'house',
    position: HOUSE_POSITIONS[index] ?? { x: 500, y: 50 + index * 240 },
    targetPosition: Position.Left,
    sourcePosition: Position.Left,
    selected: selectedNodeId === house.id,
    data: {
      kind: 'house',
      active: phase === 'decide' || phase === 'submit',
      id: house.id,
      name: house.name,
      policy: house.policy,
      actionLabel: house.actionLabel,
      baseDemand: house.baseDemand,
      proposedLoad: house.proposedLoad,
      marketLoad: house.marketLoad,
      batteryBefore: house.batteryBefore,
      batteryAfter: house.batteryAfter,
      cost: house.cost,
      price: state.price,
      batteryDelta: house.batteryDelta,
      warning: house.warning,
      decisionReason: house.decisionReason,
    },
  }));

  const priceEdges: SignalEdge[] = state.houses.map((house) => ({
    id: `price-${house.id}`,
    type: 'signal',
    source: 'market',
    target: house.id,
    animated: true,
    data: {
      kind: 'price',
      label: `read ${formatPrice(state.price)}`,
      phase,
      active: phase === 'price',
    },
  }));

  const demandEdges: SignalEdge[] = state.houses.map((house) => ({
    id: `demand-${house.id}`,
    type: 'signal',
    source: house.id,
    target: 'market',
    animated: true,
    data: {
      kind: 'demand',
      label: `publish ${formatEnergy(house.marketLoad)}`,
      phase,
      active: phase === 'submit',
    },
  }));

  const edgesByPhase: Record<Phase, SignalEdge[]> = {
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
  return PHASE_LABELS[phase];
}
