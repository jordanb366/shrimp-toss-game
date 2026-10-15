// Draw aim line with power indicator
export function drawAimLine(ctx, gameState) {
  if (gameState.isDragging) {
    ctx.save();

    // Calculate drag distance
    const dx = gameState.dragStart.x - gameState.aimLine.x2;
    const dy = gameState.dragStart.y - gameState.aimLine.y2;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(dragDistance / 30, 1); // Max power at 30px drag

    // Draw aim line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(gameState.aimLine.x1, gameState.aimLine.y1);
    ctx.lineTo(gameState.aimLine.x2, gameState.aimLine.y2);
    ctx.stroke();

    // Draw power indicator bar
    const barWidth = 100;
    const barHeight = 15;
    const barX = gameState.aimLine.x1 - barWidth / 2;
    const barY = gameState.aimLine.y1 - 50;

    // Background bar
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Power fill
    ctx.fillStyle = `rgba(255, ${Math.floor(100 + power * 155)}, 100, 0.8)`;
    ctx.fillRect(barX, barY, barWidth * power, barHeight);

    // Power text
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Power: ${Math.floor(power * 100)}%`,
      gameState.aimLine.x1,
      barY - 10,
    );

    ctx.restore();
  }
}
