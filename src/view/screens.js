const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

export function showGameScreen() {
  menuScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

export function showMenuScreen() {
  gameScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
  const overlay = document.querySelector(".game-over-overlay");
  if (overlay) overlay.remove();
}

export function showGameOver(score, { onPlayAgain, onBackToMenu }) {
  const overlay = document.createElement("div");
  overlay.className = "game-over-overlay";
  overlay.innerHTML = `
    <div class="game-over-content">
      <h2>Time's Up! 🎯</h2>
      <p class="final-score">Final Score: <span>${score}</span></p>
      <div class="game-over-buttons">
        <button class="game-over-btn" data-action="play-again">Play Again</button>
        <button class="game-over-btn secondary" data-action="menu">Back to Menu</button>
      </div>
    </div>
  `;
  overlay.querySelector('[data-action="play-again"]').addEventListener("click", onPlayAgain);
  overlay.querySelector('[data-action="menu"]').addEventListener("click", onBackToMenu);
  document.body.appendChild(overlay);
}
