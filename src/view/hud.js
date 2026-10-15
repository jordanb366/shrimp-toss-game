const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");

export function updateScoreDisplay(score) {
  scoreDisplay.textContent = score;
}

export function updateTimerDisplay(timeRemaining) {
  timerDisplay.textContent = Math.ceil(timeRemaining);
  timerDisplay.parentElement.classList.toggle("warning", timeRemaining <= 10);
}

export function resetHud(selectedTime) {
  scoreDisplay.textContent = "0";
  timerDisplay.textContent = selectedTime;
}
