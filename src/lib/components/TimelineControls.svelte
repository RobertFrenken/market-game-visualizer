<script lang="ts">
  import { Pause, Play, RotateCcw, SkipBack, SkipForward } from '@lucide/svelte';
  import { PHASES, phaseLabel, type Phase } from '../flow/graph';

  interface Props {
    hour: number;
    phase: Phase;
    playing: boolean;
    maxHour: number;
    onHourChange: (hour: number) => void;
    onPhaseChange: (phase: Phase) => void;
    onTogglePlay: () => void;
    onReset: () => void;
    onStepBack: () => void;
    onStepForward: () => void;
  }

  let {
    hour,
    phase,
    playing,
    maxHour,
    onHourChange,
    onPhaseChange,
    onTogglePlay,
    onReset,
    onStepBack,
    onStepForward,
  }: Props = $props();
</script>

<section class="timeline" aria-label="Timeline controls">
  <div class="time-row">
    <button type="button" class="icon-button" onclick={onReset} aria-label="Reset simulation" title="Reset">
      <RotateCcw size={18} />
    </button>
    <button type="button" class="icon-button" onclick={onStepBack} aria-label="Step backward" title="Step backward">
      <SkipBack size={18} />
    </button>
    <button type="button" class="primary-button" onclick={onTogglePlay} aria-label={playing ? 'Pause' : 'Play'}>
      {#if playing}
        <Pause size={18} />
        Pause
      {:else}
        <Play size={18} />
        Play
      {/if}
    </button>
    <button type="button" class="icon-button" onclick={onStepForward} aria-label="Step forward" title="Step forward">
      <SkipForward size={18} />
    </button>
    <div class="hour-label">Hour {hour}</div>
  </div>

  <label class="slider-label" for="hour-slider">Hour</label>
  <input
    id="hour-slider"
    type="range"
    min="0"
    max={maxHour}
    value={hour}
    oninput={(event) => onHourChange(Number(event.currentTarget.value))}
  />

  <div class="phase-tabs" aria-label="Phase">
    {#each PHASES as phaseOption}
      <button
        type="button"
        class:active={phase === phaseOption}
        onclick={() => onPhaseChange(phaseOption)}
      >
        {phaseLabel(phaseOption)}
      </button>
    {/each}
  </div>
</section>

<style>
  .timeline {
    display: grid;
    gap: 12px;
  }

  .time-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
  }

  .icon-button,
  .primary-button,
  .phase-tabs button {
    border: 1px solid #c8ced8;
    background: #ffffff;
    color: #172033;
    cursor: pointer;
    font: inherit;
  }

  .icon-button {
    width: 36px;
    height: 36px;
    display: inline-grid;
    place-items: center;
    border-radius: 6px;
  }

  .primary-button {
    height: 36px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    border-radius: 6px;
    background: #16324f;
    color: #ffffff;
    border-color: #16324f;
  }

  .hour-label {
    margin-left: auto;
    font-weight: 700;
    color: #172033;
  }

  .slider-label {
    font-size: 12px;
    color: #596579;
  }

  input[type='range'] {
    width: 100%;
  }

  .phase-tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }

  .phase-tabs button {
    min-height: 42px;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 12px;
    line-height: 1.2;
  }

  .phase-tabs button.active {
    background: #e7f0f8;
    border-color: #355c7d;
    color: #10243a;
    font-weight: 700;
  }
</style>
