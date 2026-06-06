# Optional Python API

The visualizer currently mirrors the market rules in TypeScript so it can run as
a static browser app. If correctness against the Python game core becomes more
important than static hosting, use a small Python API and make
`python.market_game_core` the source of truth.

## Shape

```text
Svelte app
  -> HTTP API
  -> python.market_game_core
```

Recommended endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /health` | Confirm the Python service is running. |
| `GET /scenarios/default` | Return the default house/policy scenario. |
| `POST /simulate` | Run a full 24-hour scenario and return hourly states. |
| `POST /step` | Run one hour from supplied state and submitted loads. |

## Local Dev Config

Add a frontend env var:

```bash
VITE_MARKET_API_URL=http://localhost:8000
```

Svelte usage:

```ts
const apiUrl = import.meta.env.VITE_MARKET_API_URL;
const result = await fetch(`${apiUrl}/simulate`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(scenario),
});
```

## Minimal Backend Sketch

```python
from fastapi import FastAPI
from pydantic import BaseModel

from python.market_game_core import MarketScenario, run_scenario

app = FastAPI()


class SimulateRequest(BaseModel):
    # Keep this schema small at first: profile name, house policies, initial price.
    scenario: dict


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/simulate")
def simulate(request: SimulateRequest):
    # Translate request.scenario into MarketScenario here.
    result = run_scenario(MarketScenario(policies=[]))
    return result
```

## Tradeoff

Use the API when policy/rule parity matters. Keep the TypeScript-only version
when the priority is a static, dependency-light teaching visualizer.
