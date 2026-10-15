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
import { setupInput } from "./input.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const resetBtn = document.getElementById("resetBtn");
const menuBtn = document.getElementById("menuBtn");
const startBtn = document.getElementById("startBtn");

if (!canvas || !ctx) {
  console.error("Canvas not found!");
}

const gameState = createGameState();

function startRound() {
  gameState.isGameRunning = true;
  showGameScreen();
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
  showGameOver(gameState.score, {
    onPlayAgain: () => location.reload(),
    onBackToMenu: goToMenu,
  });
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
