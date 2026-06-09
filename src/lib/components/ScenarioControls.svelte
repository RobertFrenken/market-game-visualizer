<script lang="ts">
  import { SlidersHorizontal } from '@lucide/svelte';

  import type { HouseSpec } from '../market/simulator';
  import type { PolicyKind } from '../market/rules';

  interface Props {
    houses: HouseSpec[];
    onPolicyChange: (houseId: string, policy: PolicyKind) => void;
  }

  const policyOptions: { value: PolicyKind; label: string; description: string }[] = [
    { value: 'follow', label: 'Follow demand', description: 'No battery action' },
    { value: 'flatten', label: 'Flatten demand', description: 'Charges low, discharges high load' },
    { value: 'price-aware', label: 'Price aware', description: 'Responds to market price bands' },
  ];

  let { houses, onPolicyChange }: Props = $props();
</script>

<section class="scenario" aria-label="Scenario controls">
  <header>
    <SlidersHorizontal size={17} />
    <h2>Scenario</h2>
  </header>

  <div class="policy-grid">
    {#each houses as house}
      <label>
        <span>{house.name}</span>
        <select
          value={house.policy}
          onchange={(event) => onPolicyChange(house.id, event.currentTarget.value as PolicyKind)}
        >
          {#each policyOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <small>{policyOptions.find((option) => option.value === house.policy)?.description}</small>
      </label>
    {/each}
  </div>
</section>

<style>
  .scenario {
    display: grid;
    gap: 12px;
    border: 1px solid #d7dce5;
    border-radius: 6px;
    padding: 12px;
    background: #ffffff;
  }

  header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #355c7d;
  }

  h2 {
    margin: 0;
    color: #172033;
    font-size: 15px;
    letter-spacing: 0;
  }

  .policy-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  label {
    display: grid;
    gap: 5px;
    min-width: 0;
  }

  span,
  small {
    color: #596579;
    font-size: 12px;
  }

  select {
    width: 100%;
    min-height: 34px;
    border: 1px solid #c8ced8;
    border-radius: 6px;
    padding: 0 8px;
    background: #f8fafc;
    color: #172033;
  }

  small {
    line-height: 1.25;
  }

  @media (max-width: 680px) {
    .policy-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
