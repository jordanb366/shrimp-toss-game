# shrimp-toss-game

## Running locally

The game uses ES modules, which browsers block over `file://`, so serve the folder over HTTP:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Project layout

- `src/config.js`: canvas size and physics constants
- `src/model/`: game state and rules (`gameState.js`, `shrimp.js`, `customer.js`). No DOM or canvas access.
- `src/view/`: canvas drawing (`background.js`, `cook.js`, `customers.js`, `shrimp.js`, `aimLine.js`) and DOM/UI updates (`hud.js`, `screens.js`)
- `src/input.js`: mouse and touch handlers that translate pointer events into model actions
- `src/main.js`: entry point. Wires everything together and runs the game loop.
