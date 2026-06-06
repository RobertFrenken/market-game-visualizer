import {
  BATTERY_CAPACITY,
  MAX_CHARGE,
  MAX_DISCHARGE,
  type BatteryAction,
  type PolicyKind,
} from './rules';

export interface PolicyContext {
  price: number;
  hour: number;
  batteryCharge: number;
  demand: number[];
  priceHistory: number[];
}

function reserveTarget(hour: number): number {
  if (hour < 12) return 4;
  if (hour < 18) return 8;
  if (hour < 21) return 3;
  return 0;
}

export function choosePolicyAction(kind: PolicyKind, context: PolicyContext): BatteryAction {
  const baseDemand = context.demand[context.hour];

  if (kind === 'follow') {
    return 0;
  }

  if (kind === 'flatten') {
    const target = context.demand.reduce((total, value) => total + value, 0) / context.demand.length;
    const desiredChange = target - baseDemand;
    if (desiredChange > 0 && context.batteryCharge < BATTERY_CAPACITY) return 1;
    if (desiredChange < 0 && context.batteryCharge > 0) return -1;
    return 0;
  }

  const reserve = reserveTarget(context.hour);
  const availableDischarge = Math.max(0, context.batteryCharge - reserve);

  if (context.price <= 0.12 && context.batteryCharge < BATTERY_CAPACITY) return 1;
  if (context.price <= 0.19 && context.batteryCharge < reserve) return 1;
  if (context.price >= 0.49 && context.batteryCharge > 0) return -1;
  if (context.price >= 0.25 && availableDischarge > 0) return -1;
  if (context.hour >= 21 && context.batteryCharge > 0) return -1;
  return 0;
}

export function actionLabel(action: BatteryAction): string {
  if (action === 1) return 'charge';
  if (action === -1) return 'discharge';
  return 'neutral';
}

export function actionDelta(action: BatteryAction): number {
  if (action === 1) return MAX_CHARGE;
  if (action === -1) return -MAX_DISCHARGE;
  return 0;
}
