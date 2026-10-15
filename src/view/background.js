import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../config.js";

// Draw the restaurant background and scene
export function drawRestaurantBackground(ctx) {
  // Floor (dark wood)
  ctx.fillStyle = "#3D2817";
  ctx.fillRect(0, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 60);

  // Floor shine/grain
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 2;
  for (let i = 0; i < CANVAS_WIDTH; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, CANVAS_HEIGHT - 60);
    ctx.lineTo(i + 60, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Walls - back wall
  ctx.fillStyle = "#2A1810";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - 60);

  // Wall texture - horizontal lines (wood paneling)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < CANVAS_HEIGHT - 60; i += 25) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(CANVAS_WIDTH, i);
    ctx.stroke();
  }

  // Wall texture - vertical lines (wood grain)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  for (let i = 0; i < CANVAS_WIDTH; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, CANVAS_HEIGHT - 60);
    ctx.stroke();
  }

  // Left wall accent
  const leftWallGradient = ctx.createLinearGradient(0, 0, 80, 0);
  leftWallGradient.addColorStop(0, "rgba(0, 0, 0, 0.4)");
  leftWallGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = leftWallGradient;
  ctx.fillRect(0, 0, 80, CANVAS_HEIGHT - 60);

  // Right wall accent
  const rightWallGradient = ctx.createLinearGradient(
    CANVAS_WIDTH - 80,
    0,
    CANVAS_WIDTH,
    0,
  );
  rightWallGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  rightWallGradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = rightWallGradient;
  ctx.fillRect(CANVAS_WIDTH - 80, 0, 80, CANVAS_HEIGHT - 60);

  // Ceiling/Top area - darker
  ctx.fillStyle = "#1a0f0a";
  ctx.fillRect(0, 0, CANVAS_WIDTH, 30);

  // Hanging lights
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(150, 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
  ctx.beginPath();
  ctx.arc(150, 20, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(400, 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
  ctx.beginPath();
  ctx.arc(400, 20, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(650, 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
  ctx.beginPath();
  ctx.arc(650, 20, 12, 0, Math.PI * 2);
  ctx.fill();

  // Japanese character decor on back wall
  ctx.fillStyle = "rgba(255, 200, 0, 0.3)";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.globalAlpha = 0.15;
  ctx.fillText("鉄板焼き", CANVAS_WIDTH / 2, 120);
  ctx.globalAlpha = 1.0;

  // Restaurant counter background
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 320, CANVAS_WIDTH, 40);

  // Red accent stripe (typical hibachi restaurant style)
  ctx.fillStyle = "#CC0000";
  ctx.fillRect(0, 325, CANVAS_WIDTH, 3);
}

// Draw the teppanyaki/hibachi grill
export function drawGrill(ctx) {
  ctx.save();

  // Grill surface (flat iron cooktop)
  const grillX = CANVAS_WIDTH / 2;
  const grillY = 380;
  const grillWidth = 500;
  const grillHeight = 120;

  // Main grill body
  ctx.fillStyle = "#2C2C2C";
  ctx.fillRect(grillX - grillWidth / 2, grillY, grillWidth, grillHeight);

  // Grill surface (dark gray with metallic sheen)
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(grillX - grillWidth / 2 + 10, grillY + 10, grillWidth - 20, 60);

  // Metallic shine on grill
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(grillX - grillWidth / 2 + 20, grillY + 15);
  ctx.lineTo(grillX + grillWidth / 2 - 20, grillY + 15);
  ctx.stroke();

  // Grill controls/front panel
  ctx.fillStyle = "#444";
  ctx.fillRect(grillX - grillWidth / 2 + 20, grillY + 80, grillWidth - 40, 30);

  // Burner knobs
  ctx.fillStyle = "#666";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(grillX - 150 + i * 75, grillY + 105, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Heat shimmer effect (animated)
  ctx.strokeStyle = "rgba(255, 150, 0, 0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(grillX - grillWidth / 2 + 40, grillY + 30 - i * 8);
    ctx.quadraticCurveTo(
      grillX,
      grillY + 20 - i * 8,
      grillX + grillWidth / 2 - 40,
      grillY + 30 - i * 8,
    );
    ctx.stroke();
  }

  ctx.restore();
}
