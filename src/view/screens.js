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

export function showGameOver(score, difficulty, {
  onPlayAgain,
  onBackToMenu,
  onSubmitScore,
}) {
  const overlay = document.createElement("div");
  overlay.className = "game-over-overlay";
  overlay.innerHTML = `
    <div class="game-over-content">
      <h2>Time's Up! 🎯</h2>
      <p class="final-score">Final Score: <span>${score}</span></p>
      <form class="score-form">
        <label for="playerName">Add your score to the board</label>
        <input id="playerName" name="playerName" maxlength="20" required autocomplete="nickname" placeholder="Your name" />
        <p class="score-submit-status" aria-live="polite"></p>
        <button class="game-over-btn" type="submit">Submit Score</button>
      </form>
      <div class="game-over-buttons">
        <button class="game-over-btn" data-action="play-again">Play Again</button>
        <button class="game-over-btn secondary" data-action="menu">Back to Menu</button>
      </div>
    </div>
  `;
  const form = overlay.querySelector(".score-form");
  const status = overlay.querySelector(".score-submit-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button");
    submitButton.disabled = true;
    status.textContent = "Submitting...";
    try {
      await onSubmitScore(form.elements.playerName.value, score, difficulty);
      status.textContent = "Score submitted!";
      form.remove();
    } catch (error) {
      status.textContent = error.message;
      submitButton.disabled = false;
    }
  });
  overlay.querySelector('[data-action="play-again"]').addEventListener("click", onPlayAgain);
  overlay.querySelector('[data-action="menu"]').addEventListener("click", onBackToMenu);
  document.body.appendChild(overlay);
}
