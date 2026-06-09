<script lang="ts">
  import { onMount } from 'svelte';
  import { Background, BackgroundVariant, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import type { EdgeTypes, NodeEventWithPointer, NodeTypes } from '@xyflow/svelte';

  import HouseNode from './lib/components/HouseNode.svelte';
  import MetricsPanel from './lib/components/MetricsPanel.svelte';
  import MarketNode from './lib/components/MarketNode.svelte';
  import NodeInspector from './lib/components/NodeInspector.svelte';
  import PriceCurve from './lib/components/PriceCurve.svelte';
  import ScenarioControls from './lib/components/ScenarioControls.svelte';
  import SignalEdge from './lib/components/SignalEdge.svelte';
  import TimelineControls from './lib/components/TimelineControls.svelte';
  import { graphForHour, PHASES, phaseLabel, type FlowNode, type Phase } from './lib/flow/graph';
  import { EPISODE_HOURS, formatNumber, type PolicyKind } from './lib/market/rules';
  import { DEFAULT_HOUSES, simulateMarket } from './lib/market/simulator';

  const nodeTypes: NodeTypes = {
    house: HouseNode,
    market: MarketNode,
  };
  const edgeTypes: EdgeTypes = {
    signal: SignalEdge,
  };

  let houses = $state(DEFAULT_HOUSES);
  let hour = $state(0);
  let phaseIndex = $state(0);
  let playing = $state(false);
  let loaded = $state(false);
  let selectedNodeId = $state('market');

  let states = $derived(simulateMarket(houses));
  let phase = $derived(PHASES[phaseIndex]);
  let currentState = $derived(states[hour]);
  let graph = $derived(graphForHour(currentState, phase, selectedNodeId));
  let selectedNode = $derived(graph.nodes.find((node) => node.id === selectedNodeId) ?? graph.nodes[0]);

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

  function setHousePolicy(houseId: string, policy: PolicyKind) {
    houses = houses.map((house) => (house.id === houseId ? { ...house, policy } : house));
  }

  function selectNode({ node }: Parameters<NodeEventWithPointer<MouseEvent | TouchEvent, FlowNode>>[0]) {
    selectedNodeId = node.id;
  }

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
        <SvelteFlow
          nodes={graph.nodes}
          edges={graph.edges}
          {nodeTypes}
          {edgeTypes}
          fitView
          minZoom={0.45}
          maxZoom={1.35}
          nodesDraggable={false}
          onnodeclick={selectNode}
        >
          <Controls />
          <MiniMap pannable zoomable />
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        </SvelteFlow>
      {/if}
    </section>

    <aside class="side-panel" aria-label="Simulation controls and metrics">
      <ScenarioControls {houses} onPolicyChange={setHousePolicy} />

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
      <NodeInspector data={selectedNode.data} />
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
