# shrimp-toss-game

## Running locally

The game and its high-score API run from the included Node.js server:

```sh
npm start
```

Then open http://localhost:3000 (set the `PORT` environment variable to use a different port).

High scores are shared by clients using the server and stored in
`data/highscores.json`. The API keeps the ten highest scores. Scores are
validated for format and size, but they are submitted by the browser and
should not be treated as cheat-resistant.

The API exposes:

- `GET /api/highscores` - returns the current top ten scores.
- `POST /api/highscores` - accepts `{ "name", "score", "difficulty" }`.

## Project layout

- `server.js`: static file server and high-score API
- `data/highscores.json`: persistent high-score storage
- `src/leaderboard.js`: browser client for the high-score API
- `src/config.js`: canvas size and physics constants
- `src/model/`: game state and rules (`gameState.js`, `shrimp.js`, `customer.js`). No DOM or canvas access.
- `src/view/`: canvas drawing (`background.js`, `cook.js`, `customers.js`, `shrimp.js`, `aimLine.js`) and DOM/UI updates (`hud.js`, `screens.js`)
- `src/input.js`: mouse and touch handlers that translate pointer events into model actions
- `src/main.js`: entry point. Wires everything together and runs the game loop.
