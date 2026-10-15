import {
  createGameState,
  resetRound,
  tickTimer,
  stepShrimps,
} from "./model/gameState.js";
import { drawRestaurantBackground, drawGrill } from "./view/background.js";
import { drawCook } from "./view/cook.js";
import { drawSeatedCustomer } from "./view/customers.js";
import { drawShrimp } from "./view/shrimp.js";
import { drawAimLine } from "./view/aimLine.js";
import {
  updateScoreDisplay,
  updateTimerDisplay,
  resetHud,
} from "./view/hud.js";
import {
  showGameScreen,
  showMenuScreen,
  showGameOver,
} from "./view/screens.js";
import { getHighScores, submitHighScore } from "./leaderboard.js";
import { setupInput } from "./input.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const resetBtn = document.getElementById("resetBtn");
const menuBtn = document.getElementById("menuBtn");
const startBtn = document.getElementById("startBtn");
const difficultyDisplay = document.getElementById("difficulty");

const difficultyNames = {
  30: "Hard",
  60: "Normal",
  90: "Easy",
};

if (!canvas || !ctx) {
  console.error("Canvas not found!");
}

const gameState = createGameState();

function startRound() {
  gameState.isGameRunning = true;
  showGameScreen();
  difficultyDisplay.textContent = difficultyNames[gameState.selectedTime];
  resetRoundState();
}

function resetRoundState() {
  resetRound(gameState);
  resetHud(gameState.selectedTime);
}

function goToMenu() {
  gameState.isGameRunning = false;
  gameState.gameOver = false;
  showMenuScreen();
}

function endRound() {
  showGameOver(gameState.score, gameState.selectedTime, {
    onPlayAgain: () => location.reload(),
    onBackToMenu: goToMenu,
    onSubmitScore: async (name, score, difficulty) => {
      const scores = await submitHighScore({ name, score, difficulty });
      await loadHighScores();
      return scores;
    },
  });
}

async function loadHighScores() {
  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = '<p class="leaderboard-status">Loading high scores...</p>';
  try {
    renderHighScores(await getHighScores());
  } catch (error) {
    leaderboard.innerHTML = `<p class="leaderboard-status error">${error.message}</p>`;
  }
}

function renderHighScores(scores) {
  const leaderboard = document.getElementById("leaderboard");
  if (!scores.length) {
    leaderboard.innerHTML = '<p class="leaderboard-status">No scores yet.</p>';
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead><tr><th scope="col">Rank</th><th scope="col">Name</th><th scope="col">Score</th><th scope="col">Mode</th></tr></thead>
    <tbody></tbody>
  `;
  const body = table.querySelector("tbody");
  scores.forEach((entry, index) => {
    const row = document.createElement("tr");
    [index + 1, entry.name, entry.score, difficultyNames[entry.difficulty] || "Unknown"]
      .forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
    body.appendChild(row);
  });
  leaderboard.replaceChildren(table);
}

function update() {
  if (gameState.isGameRunning && !gameState.gameOver) {
    const timeUp = tickTimer(gameState, Date.now());
    updateTimerDisplay(gameState.timeRemaining);
    if (timeUp) endRound();
  }

  for (const customer of gameState.customers) {
    customer.update();
  }
  stepShrimps(gameState);
  updateScoreDisplay(gameState.score);
}

function draw() {
  if (!ctx || !canvas) return;

  drawRestaurantBackground(ctx);

  for (const [index, customer] of gameState.customers.entries()) {
    drawSeatedCustomer(ctx, customer, index);
  }

  drawGrill(ctx);
  drawCook(ctx, gameState);

  for (const shrimp of gameState.shrimps) {
    drawShrimp(ctx, shrimp);
  }

  drawAimLine(ctx, gameState);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

if (canvas) {
  setupInput(canvas, gameState);
}

startBtn.addEventListener("click", startRound);
resetBtn.addEventListener("click", resetRoundState);
menuBtn.addEventListener("click", goToMenu);
loadHighScores();

document.querySelectorAll(".difficulty-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    document
      .querySelectorAll(".difficulty-btn")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    gameState.selectedTime = parseInt(e.target.dataset.time);
  });
});

gameLoop();
