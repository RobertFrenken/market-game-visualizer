export const EPISODE_HOURS = 24;
export const INITIAL_PRICE = 0.5;
export const BATTERY_CAPACITY = 20;
export const MAX_CHARGE = 5;
export const MAX_DISCHARGE = 10;

export const PROFILE1_DEMAND = [
  2, 1, 1, 1, 2, 4, 6, 8, 9, 7, 5, 4, 3, 4, 5, 7, 9, 12, 10, 7, 5, 4, 2, 2,
];

export type BatteryAction = -1 | 0 | 1;

export type PolicyKind = 'follow' | 'flatten' | 'price-aware';

export interface ClampResult {
  marketLoad: number;
  warning: string;
}

export function priceFromAverageLoad(averageLoad: number): number {
  if (averageLoad < 3) return 0.1;
  if (averageLoad < 6) return 0.1 + 0.03 * (averageLoad - 3);
  if (averageLoad < 9) return 0.19 + 0.1 * (averageLoad - 6);
  if (averageLoad < 13) return 0.49 + 0.25 * (averageLoad - 9);
  return 1.49 + (averageLoad - 13);
}

export function clampMarketLoad(
  proposedLoad: number,
  baseDemand: number,
  batteryCharge: number,
): ClampResult {
  if (proposedLoad >= baseDemand + (BATTERY_CAPACITY - batteryCharge)) {
    return {
      marketLoad: baseDemand + (BATTERY_CAPACITY - batteryCharge),
      warning: 'charge exceeds storage capacity',
    };
  }
  if (proposedLoad >= baseDemand + MAX_CHARGE) {
    return {
      marketLoad: baseDemand + MAX_CHARGE,
      warning: 'charge exceeds hourly rate',
    };
  }
  if (proposedLoad <= baseDemand - batteryCharge) {
    return {
      marketLoad: baseDemand - batteryCharge,
      warning: 'discharge exceeds stored energy',
    };
  }
  if (proposedLoad <= baseDemand - MAX_DISCHARGE) {
    return {
      marketLoad: baseDemand - MAX_DISCHARGE,
      warning: 'discharge exceeds hourly rate',
    };
  }
  return { marketLoad: proposedLoad, warning: '' };
}

export function actionToMarketLoad(
  action: BatteryAction,
  baseDemand: number,
  batteryCharge: number,
): number {
  if (action === -1) {
    return clampMarketLoad(baseDemand - MAX_DISCHARGE, baseDemand, batteryCharge).marketLoad;
  }
  if (action === 1) {
    return clampMarketLoad(baseDemand + MAX_CHARGE, baseDemand, batteryCharge).marketLoad;
  }
  return baseDemand;
}

export function formatNumber(value: number, digits = 2): string {
  return value.toFixed(digits).replace(/\.?0+$/, '');
}
