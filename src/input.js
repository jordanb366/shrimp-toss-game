import {
  startDrag,
  updateAim,
  releaseShrimp,
} from "./model/gameState.js";

// Maps a pointer/touch position to canvas coordinates
function toCanvasPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

export function setupInput(canvas, state) {
  canvas.addEventListener("mousedown", (e) => {
    if (!state.isGameRunning || state.gameOver) return;
    const { x, y } = toCanvasPoint(canvas, e.clientX, e.clientY);
    startDrag(state, x, y);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!state.isDragging) return;
    const { x, y } = toCanvasPoint(canvas, e.clientX, e.clientY);
    updateAim(state, x, y);
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!state.isDragging) return;
    const { x, y } = toCanvasPoint(canvas, e.clientX, e.clientY);
    releaseShrimp(state, x, y);
  });

  canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const { x, y } = toCanvasPoint(canvas, touch.clientX, touch.clientY);
    startDrag(state, x, y);
  });

  canvas.addEventListener("touchmove", (e) => {
    if (state.isDragging) {
      const touch = e.touches[0];
      const { x, y } = toCanvasPoint(canvas, touch.clientX, touch.clientY);
      updateAim(state, x, y);
    }
    e.preventDefault();
  });

  canvas.addEventListener("touchend", (e) => {
    if (state.isDragging) {
      const touch = e.changedTouches[0];
      const { x, y } = toCanvasPoint(canvas, touch.clientX, touch.clientY);
      releaseShrimp(state, x, y);
    }
    e.preventDefault();
  });
}
