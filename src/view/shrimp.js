export function drawShrimp(ctx, shrimp) {
  ctx.save();

  // Shrimp body - curved
  ctx.fillStyle = "#FF6B6B";
  ctx.beginPath();
  ctx.ellipse(
    shrimp.x,
    shrimp.y,
    shrimp.radius * 1.3,
    shrimp.radius * 0.8,
    Math.PI / 4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Shrimp tail
  ctx.fillStyle = "#E84C3D";
  ctx.beginPath();
  ctx.ellipse(shrimp.x + 12, shrimp.y + 8, 6, 4, Math.PI / 3, 0, Math.PI * 2);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = "#FF6B6B";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(shrimp.x - 6, shrimp.y - 6);
  ctx.quadraticCurveTo(shrimp.x - 12, shrimp.y - 15, shrimp.x - 10, shrimp.y - 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shrimp.x + 6, shrimp.y - 6);
  ctx.quadraticCurveTo(shrimp.x + 12, shrimp.y - 15, shrimp.x + 10, shrimp.y - 22);
  ctx.stroke();

  // Legs (simple segments)
  ctx.strokeStyle = "#E84C3D";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(shrimp.x - 8 + i * 8, shrimp.y + 4);
    ctx.lineTo(shrimp.x - 8 + i * 8, shrimp.y + 10);
    ctx.stroke();
  }

  // Shine/highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.ellipse(shrimp.x - 4, shrimp.y - 3, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
