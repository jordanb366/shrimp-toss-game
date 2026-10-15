const SKIN = "#F2C7A0";
const SKIN_SHADE = "#CF9A70";
const INK = "#2A1A10";

// Draw cook/toss point (now behind the grill)
export function drawCook(ctx, gameState) {
  ctx.save();

  const chefX = gameState.chefX;
  const chefY = gameState.chefY;

  drawShadow(ctx, chefX, chefY);
  drawJacket(ctx, chefX, chefY);
  drawNeck(ctx, chefX, chefY);
  drawToque(ctx, chefX, chefY);
  drawFace(ctx, chefX, chefY);
  drawArms(ctx, chefX, chefY);
  drawSpatula(ctx, gameState);

  ctx.restore();
}

function drawShadow(ctx, chefX, chefY) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(chefX, chefY + 90, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawJacket(ctx, x, y) {
  const coat = ctx.createLinearGradient(0, y - 4, 0, y + 46);
  coat.addColorStop(0, "#FFFFFF");
  coat.addColorStop(1, "#E3E3E3");

  // Double-breasted jacket with sloped shoulders
  ctx.fillStyle = coat;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 4);
  ctx.bezierCurveTo(x - 20, y - 3, x - 26, y + 1, x - 27, y + 10);
  ctx.lineTo(x - 28, y + 46);
  ctx.lineTo(x + 28, y + 46);
  ctx.lineTo(x + 27, y + 10);
  ctx.bezierCurveTo(x + 26, y + 1, x + 20, y - 3, x + 10, y - 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#BDBDBD";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Lapels meeting at the open collar
  ctx.strokeStyle = "#B5B5B5";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 4);
  ctx.lineTo(x - 2, y + 12);
  ctx.moveTo(x + 10, y - 4);
  ctx.lineTo(x + 2, y + 12);
  ctx.stroke();

  // Double-breasted buttons
  ctx.fillStyle = "#8F8F8F";
  for (const bx of [x - 7, x + 7]) {
    for (const by of [y + 16, y + 28, y + 40]) {
      ctx.beginPath();
      ctx.arc(bx, by, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Black apron over the lower jacket
  ctx.fillStyle = "#1F1F1F";
  ctx.beginPath();
  ctx.moveTo(x - 17, y + 18);
  ctx.lineTo(x + 17, y + 18);
  ctx.lineTo(x + 19, y + 46);
  ctx.lineTo(x - 19, y + 46);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3A3A3A";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 13, y + 2);
  ctx.lineTo(x - 17, y + 18);
  ctx.moveTo(x + 13, y + 2);
  ctx.lineTo(x + 17, y + 18);
  ctx.stroke();
}

function drawNeck(ctx, x, y) {
  ctx.fillStyle = SKIN_SHADE;
  ctx.fillRect(x - 7, y - 10, 14, 12);
}

function drawToque(ctx, x, y) {
  // Pleated puffs, back to front
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#E0E0E0";
  ctx.lineWidth = 1.2;
  const puffs = [
    [x - 12, y - 47, 11],
    [x + 12, y - 47, 11],
    [x, y - 54, 13],
    [x - 6, y - 44, 10],
    [x + 6, y - 44, 10],
  ];
  for (const [px, py, r] of puffs) {
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Band sitting on the forehead
  ctx.fillStyle = "#EFEFEF";
  ctx.fillRect(x - 16, y - 38, 32, 9);
  ctx.strokeStyle = "#C9C9C9";
  ctx.strokeRect(x - 16, y - 38, 32, 9);
}

function drawFace(ctx, x, y) {
  const face = ctx.createRadialGradient(x - 5, y - 24, 2, x, y - 18, 18);
  face.addColorStop(0, SKIN);
  face.addColorStop(0.75, SKIN);
  face.addColorStop(1, SKIN_SHADE);
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(x, y - 18, 16, 17.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = SKIN_SHADE;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ears
  ctx.fillStyle = SKIN;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + side * 16, y - 15, 3, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Brows
  ctx.strokeStyle = "#5A3A22";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * 11, y - 24);
    ctx.quadraticCurveTo(x + side * 7, y - 27, x + side * 2.5, y - 24.5);
    ctx.stroke();
  }

  // Eyes with irises, highlights, and lids
  for (const side of [-1, 1]) {
    const ex = x + side * 6;
    const ey = y - 20;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4A2C18";
    ctx.beginPath();
    ctx.arc(ex, ey, 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(ex, ey, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(ex + 0.6, ey - 0.7, 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ex, ey, 3.6, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // Nose
  ctx.strokeStyle = SKIN_SHADE;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y - 16);
  ctx.quadraticCurveTo(x + 2.5, y - 12.5, x - 0.5, y - 12);
  ctx.stroke();

  // Cheeks
  ctx.fillStyle = "rgba(230, 90, 90, 0.2)";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + side * 9.5, y - 11, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smile
  ctx.strokeStyle = "#6B3A2A";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y - 11, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function drawArms(ctx, x, y) {
  ctx.lineCap = "round";

  // Left arm resting at his side
  drawSleeve(ctx, [
    [x - 22, y + 4],
    [x - 30, y + 22],
    [x - 26, y + 38],
  ]);
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(x - 26, y + 42, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Right arm reaching up to hold the spatula handle
  drawSleeve(ctx, [
    [x + 22, y + 4],
    [x + 34, y + 14],
    [x + 27, y - 8],
  ]);
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(x + 26, y - 12, 4.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSleeve(ctx, points) {
  ctx.lineJoin = "round";
  const trace = () => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
  };

  trace();
  ctx.strokeStyle = "#CFCFCF";
  ctx.lineWidth = 12;
  ctx.stroke();
  trace();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 9;
  ctx.stroke();
}

function drawSpatula(ctx, gameState) {
  const chefX = gameState.chefX;
  const chefY = gameState.chefY;

  const spatulaAngle = gameState.isDragging
    ? Math.atan2(
        gameState.aimLine.y2 - gameState.aimLine.y1,
        gameState.aimLine.x2 - gameState.aimLine.x1,
      ) -
      Math.PI / 4
    : -Math.PI / 6;

  ctx.translate(chefX + 8, chefY - 5);
  ctx.rotate(spatulaAngle);

  // Wooden handle
  ctx.strokeStyle = "#8B4513";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(35, 0);
  ctx.stroke();

  // Metal blade
  ctx.fillStyle = "#C0C0C0";
  ctx.fillRect(30, -10, 20, 20);
  ctx.strokeStyle = "#A9A9A9";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, -10, 20, 20);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillRect(33, -7, 8, 4);

  if (!gameState.isDragging) {
    drawShrimpOnSpatula(ctx);
  }
}

function drawShrimpOnSpatula(ctx) {
  const shrimpX = 40;
  const shrimpY = -8;

  ctx.fillStyle = "#FF6B6B";
  ctx.beginPath();
  ctx.ellipse(shrimpX, shrimpY, 6, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#E84C3D";
  ctx.beginPath();
  ctx.ellipse(shrimpX + 8, shrimpY + 4, 4, 2.5, Math.PI / 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#FF6B6B";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(shrimpX - 4, shrimpY - 4);
  ctx.quadraticCurveTo(shrimpX - 7, shrimpY - 9, shrimpX - 6, shrimpY - 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shrimpX + 4, shrimpY - 4);
  ctx.quadraticCurveTo(shrimpX + 7, shrimpY - 9, shrimpX + 6, shrimpY - 13);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.ellipse(shrimpX - 2, shrimpY - 2, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
}
