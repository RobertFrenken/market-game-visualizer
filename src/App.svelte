<script lang="ts">
  import { onMount } from 'svelte';
  import { Background, BackgroundVariant, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import type { Edge, Node } from '@xyflow/svelte';

  import MetricsPanel from './lib/components/MetricsPanel.svelte';
  import PriceCurve from './lib/components/PriceCurve.svelte';
  import TimelineControls from './lib/components/TimelineControls.svelte';
  import { graphForHour, PHASES, phaseLabel, type Phase } from './lib/flow/graph';
  import { EPISODE_HOURS, formatNumber } from './lib/market/rules';
  import { simulateMarket } from './lib/market/simulator';

  const states = simulateMarket();
  let nodes = $state<Node[]>([]);
  let edges = $state<Edge[]>([]);

  let hour = $state(0);
  let phaseIndex = $state(0);
  let playing = $state(false);
  let loaded = $state(false);

  let phase = $derived(PHASES[phaseIndex]);
  let currentState = $derived(states[hour]);

  function syncGraph() {
    const graph = graphForHour(currentState, phase);
    nodes = graph.nodes;
    edges = graph.edges;
  }

  function setHour(nextHour: number) {
    hour = Math.max(0, Math.min(EPISODE_HOURS - 1, nextHour));
  }

  function setPhase(nextPhase: Phase) {
    phaseIndex = PHASES.indexOf(nextPhase);
  }

  function stepForward() {
    if (phaseIndex < PHASES.length - 1) {
      phaseIndex += 1;
      return;
    }
    phaseIndex = 0;
    hour = hour === EPISODE_HOURS - 1 ? 0 : hour + 1;
  }

  function stepBack() {
    if (phaseIndex > 0) {
      phaseIndex -= 1;
      return;
    }
    phaseIndex = PHASES.length - 1;
    hour = hour === 0 ? EPISODE_HOURS - 1 : hour - 1;
  }

  function reset() {
    playing = false;
    hour = 0;
    phaseIndex = 0;
  }

  function togglePlay() {
    playing = !playing;
  }

  $effect(() => {
    syncGraph();
  });

  $effect(() => {
    if (!playing) return;
    const timer = window.setInterval(stepForward, 1100);
    return () => window.clearInterval(timer);
  });

  onMount(() => {
    loaded = true;
  });
</script>

<main class="app-shell">
  <header class="topbar">
    <div>
      <h1>Market Game Visualizer</h1>
      <p>House agents submit hourly demand to a market maker; aggregate demand sets the next price.</p>
    </div>
    <div class="status-pill">
      <span>Phase</span>
      <strong>{phaseLabel(phase)}</strong>
    </div>
  </header>

  <section class="workspace">
    <section class="flow-panel" aria-label="Market graph">
      {#if loaded}
        <SvelteFlow {nodes} {edges} fitView minZoom={0.45} maxZoom={1.35} nodesDraggable={false}>
          <Controls />
          <MiniMap pannable zoomable />
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        </SvelteFlow>
      {/if}
    </section>

    <aside class="side-panel" aria-label="Simulation controls and metrics">
      <TimelineControls
        {hour}
        {phase}
        {playing}
        maxHour={EPISODE_HOURS - 1}
        onHourChange={setHour}
        onPhaseChange={setPhase}
        onTogglePlay={togglePlay}
        onReset={reset}
        onStepBack={stepBack}
        onStepForward={stepForward}
      />

      <div class="equation-strip">
        <div><span>House</span><strong>market load = base demand + battery action</strong></div>
        <div><span>Market</span><strong>next price = price rule(average load)</strong></div>
      </div>

      <MetricsPanel state={currentState} />
      <PriceCurve {states} {hour} />

      <section class="phase-note">
        <h2>Current hour</h2>
        <p>
          The market price is ${formatNumber(currentState.price, 3)}/kWh. House demand submitted
          this hour sets the next price, ${formatNumber(currentState.nextPrice, 3)}/kWh.
        </p>
      </section>
    </aside>
  </section>
</main>
