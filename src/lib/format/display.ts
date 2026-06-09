import { formatNumber } from '../market/rules';

export function formatPrice(value: number): string {
  return `$${formatNumber(value, 3)}/kWh`;
}

export function formatCost(value: number): string {
  return `$${formatNumber(value, 3)}`;
}

export function formatEnergy(value: number): string {
  return `${formatNumber(value)} kWh`;
}

export function formatPercent(value: number): string {
  return `${formatNumber(value * 100, 0)}%`;
}
