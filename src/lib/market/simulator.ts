import { actionDelta, actionLabel, choosePolicyAction } from './policies';
import {
  INITIAL_PRICE,
  PROFILE1_DEMAND,
  clampMarketLoad,
  priceFromAverageLoad,
  type BatteryAction,
  type PolicyKind,
} from './rules';

export interface HouseSpec {
  id: string;
  name: string;
  policy: PolicyKind;
}

export interface HouseHour {
  id: string;
  name: string;
  policy: PolicyKind;
  action: BatteryAction;
  actionLabel: string;
  baseDemand: number;
  proposedLoad: number;
  marketLoad: number;
  batteryBefore: number;
  batteryAfter: number;
  cost: number;
  warning: string;
}

export interface HourState {
  hour: number;
  price: number;
  nextPrice: number;
  totalMarketLoad: number;
  averageMarketLoad: number;
  houses: HouseHour[];
}

export const DEFAULT_HOUSES: HouseSpec[] = [
  { id: 'house-a', name: 'Follow Demand', policy: 'follow' },
  { id: 'house-b', name: 'Flatten Demand', policy: 'flatten' },
  { id: 'house-c', name: 'Price Aware', policy: 'price-aware' },
];

export function simulateMarket(
  houses: HouseSpec[] = DEFAULT_HOUSES,
  demand = PROFILE1_DEMAND,
): HourState[] {
  let currentPrice = INITIAL_PRICE;
  const priceHistory: number[] = [];
  const batteries = new Map(houses.map((house) => [house.id, 0]));
  const states: HourState[] = [];

  for (let hour = 0; hour < demand.length; hour += 1) {
    priceHistory.push(currentPrice);
    const houseHours = houses.map((house) => {
      const batteryBefore = batteries.get(house.id) ?? 0;
      const baseDemand = demand[hour];
      const action = choosePolicyAction(house.policy, {
        price: currentPrice,
        hour,
        batteryCharge: batteryBefore,
        demand,
        priceHistory,
      });
      const proposedLoad = baseDemand + actionDelta(action);
      const clamp = clampMarketLoad(proposedLoad, baseDemand, batteryBefore);
      const marketLoad = clamp.marketLoad;
      const batteryAfter = batteryBefore + marketLoad - baseDemand;
      const cost = currentPrice * marketLoad;
      batteries.set(house.id, batteryAfter);
      return {
        id: house.id,
        name: house.name,
        policy: house.policy,
        action,
        actionLabel: actionLabel(action),
        baseDemand,
        proposedLoad,
        marketLoad,
        batteryBefore,
        batteryAfter,
        cost,
        warning: clamp.warning,
      };
    });

    const totalMarketLoad = houseHours.reduce((total, house) => total + house.marketLoad, 0);
    const averageMarketLoad = totalMarketLoad / houses.length;
    const nextPrice = priceFromAverageLoad(averageMarketLoad);
    states.push({
      hour,
      price: currentPrice,
      nextPrice,
      totalMarketLoad,
      averageMarketLoad,
      houses: houseHours,
    });
    currentPrice = nextPrice;
  }

  return states;
}
