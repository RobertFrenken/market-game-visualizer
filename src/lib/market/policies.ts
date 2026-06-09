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

export interface PolicyDecision {
  action: BatteryAction;
  reason: string;
}

function reserveTarget(hour: number): number {
  if (hour < 12) return 4;
  if (hour < 18) return 8;
  if (hour < 21) return 3;
  return 0;
}

export function choosePolicyDecision(kind: PolicyKind, context: PolicyContext): PolicyDecision {
  const baseDemand = context.demand[context.hour];

  if (kind === 'follow') {
    return { action: 0, reason: 'follow policy keeps market load equal to base demand' };
  }

  if (kind === 'flatten') {
    const target = context.demand.reduce((total, value) => total + value, 0) / context.demand.length;
    const desiredChange = target - baseDemand;
    if (desiredChange > 0 && context.batteryCharge < BATTERY_CAPACITY) {
      return { action: 1, reason: 'base demand is below daily average, so the battery charges' };
    }
    if (desiredChange < 0 && context.batteryCharge > 0) {
      return { action: -1, reason: 'base demand is above daily average, so the battery discharges' };
    }
    return { action: 0, reason: 'flatten policy is constrained or already near the daily average' };
  }

  const reserve = reserveTarget(context.hour);
  const availableDischarge = Math.max(0, context.batteryCharge - reserve);

  if (context.price <= 0.12 && context.batteryCharge < BATTERY_CAPACITY) {
    return { action: 1, reason: 'price is in the lowest band, so the battery charges' };
  }
  if (context.price <= 0.19 && context.batteryCharge < reserve) {
    return { action: 1, reason: 'price is low and battery charge is below the reserve target' };
  }
  if (context.price >= 0.49 && context.batteryCharge > 0) {
    return { action: -1, reason: 'price is in the highest band, so stored energy is used' };
  }
  if (context.price >= 0.25 && availableDischarge > 0) {
    return { action: -1, reason: 'price is elevated and charge above reserve is available' };
  }
  if (context.hour >= 21 && context.batteryCharge > 0) {
    return { action: -1, reason: 'late-day cleanup discharges remaining stored energy' };
  }
  return { action: 0, reason: 'price-aware policy holds position under current price and reserve' };
}

export function choosePolicyAction(kind: PolicyKind, context: PolicyContext): BatteryAction {
  return choosePolicyDecision(kind, context).action;
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
