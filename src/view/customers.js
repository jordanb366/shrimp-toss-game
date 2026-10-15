const APPEARANCES = [
  {
    skin: "#F3C9A0",
    skinShade: "#D6A27A",
    hair: "#3B2414",
    style: "short",
    shirt: "#3A6EA5",
    shirtShade: "#24476E",
  },
  {
    skin: "#D9A077",
    skinShade: "#B17A52",
    hair: "#1C1C1C",
    style: "bun",
    shirt: "#B5485D",
    shirtShade: "#7A2C3B",
  },
  {
    skin: "#8D5A3B",
    skinShade: "#6B4128",
    hair: "#2A1A10",
    style: "long",
    shirt: "#4E8A5A",
    shirtShade: "#2F5737",
  },
];

const INK = "#2A1A10";

// Each seat index picks a different look
export function drawSeatedCustomer(ctx, customer, index = 0) {
  ctx.save();

  const look = APPEARANCES[index % APPEARANCES.length];
  const { x, y, radius } = customer;

  drawFloorShadow(ctx, x, y, radius);

  if (customer.catchAnimation > 0) {
    drawCatchGlow(ctx, customer);
  }

  drawChair(ctx, x, y);
  drawBody(ctx, x, y, look);
  drawNeck(ctx, x, y, look);
  drawFace(ctx, x, y, look, customer.catchAnimation > 0);
  drawHair(ctx, x, y, look);

  if (customer.caught > 0) {
    drawCaughtBadge(ctx, customer);
  }

  ctx.restore();
}

function drawFloorShadow(ctx, x, y, radius) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + radius + 25, radius + 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCatchGlow(ctx, customer) {
  ctx.fillStyle = `rgba(255, 215, 0, ${customer.catchAnimation * 0.5})`;
  ctx.beginPath();
  ctx.arc(
    customer.x,
    customer.y - 15,
    customer.radius + customer.catchAnimation * 10,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawChair(ctx, x, y) {
  const wood = ctx.createLinearGradient(0, y - 14, 0, y + 40);
  wood.addColorStop(0, "#A0692E");
  wood.addColorStop(1, "#5C3A1E");

  // Chair back, wider than the torso so it shows at the sides
  ctx.fillStyle = wood;
  ctx.fillRect(x - 37, y - 14, 74, 54);
  ctx.strokeStyle = "#3E2612";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 37, y - 14, 74, 54);

  // Seat and legs
  ctx.fillStyle = "#6E4522";
  ctx.fillRect(x - 36, y + 38, 72, 8);
  ctx.fillStyle = "#4A2C14";
  ctx.fillRect(x - 32, y + 46, 6, 12);
  ctx.fillRect(x + 26, y + 46, 6, 12);
}

function drawBody(ctx, x, y, look) {
  const shirt = ctx.createLinearGradient(0, y - 6, 0, y + 42);
  shirt.addColorStop(0, look.shirt);
  shirt.addColorStop(1, look.shirtShade);

  // Torso with rounded shoulders
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 6);
  ctx.bezierCurveTo(x - 22, y - 4, x - 32, y + 2, x - 33, y + 14);
  ctx.lineTo(x - 31, y + 42);
  ctx.lineTo(x + 31, y + 42);
  ctx.lineTo(x + 33, y + 14);
  ctx.bezierCurveTo(x + 32, y + 2, x + 22, y - 4, x + 12, y - 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = look.shirtShade;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Neckline
  ctx.fillStyle = look.skinShade;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 6);
  ctx.lineTo(x, y + 7);
  ctx.lineTo(x + 10, y - 6);
  ctx.closePath();
  ctx.fill();

  // Arms resting in the lap
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.strokeStyle = look.shirtShade;
    ctx.lineWidth = 12;
    drawArmPath(ctx, x, y, side);
    ctx.stroke();
    ctx.strokeStyle = look.shirt;
    ctx.lineWidth = 9;
    drawArmPath(ctx, x, y, side);
    ctx.stroke();

    ctx.fillStyle = look.skin;
    ctx.beginPath();
    ctx.arc(x + side * 22, y + 37, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawArmPath(ctx, x, y, side) {
  ctx.beginPath();
  ctx.moveTo(x + side * 28, y + 6);
  ctx.quadraticCurveTo(x + side * 36, y + 24, x + side * 22, y + 36);
}

function drawNeck(ctx, x, y, look) {
  ctx.fillStyle = look.skinShade;
  ctx.fillRect(x - 6, y - 12, 12, 14);
}

function drawFace(ctx, x, y, look, mouthOpen) {
  // Head
  const face = ctx.createRadialGradient(x - 6, y - 34, 2, x, y - 24, 24);
  face.addColorStop(0, look.skin);
  face.addColorStop(0.7, look.skin);
  face.addColorStop(1, look.skinShade);
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(x, y - 24, 21, 22.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = look.skinShade;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ears
  ctx.fillStyle = look.skin;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + side * 21, y - 21, 3.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Eyebrows
  ctx.strokeStyle = look.hair;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * 13, y - 28);
    ctx.quadraticCurveTo(x + side * 9, y - 32, x + side * 3, y - 29);
    ctx.stroke();
  }

  // Eyes: whites, irises, highlights, and upper lids
  for (const side of [-1, 1]) {
    const ex = x + side * 8;
    const ey = y - 22;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(ex, ey, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(ex, ey, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(ex + 0.7, ey - 0.8, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(ex, ey, 4.2, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // Nose
  ctx.strokeStyle = look.skinShade;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y - 19);
  ctx.quadraticCurveTo(x + 2.5, y - 15, x - 0.5, y - 14.5);
  ctx.stroke();

  // Cheeks
  ctx.fillStyle = "rgba(230, 90, 90, 0.22)";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + side * 12, y - 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth: open and grinning right after a catch, otherwise a smile
  if (mouthOpen) {
    ctx.fillStyle = "#5B1F1F";
    ctx.beginPath();
    ctx.arc(x, y - 11, 6, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = "#6B3A2A";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y - 13, 5.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
}

function drawHair(ctx, x, y, look) {
  ctx.fillStyle = look.hair;

  if (look.style === "bun") {
    ctx.beginPath();
    ctx.arc(x, y - 48, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  if (look.style === "long") {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(x + side * 20, y - 10, 7, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Hair cap with a fringe across the forehead
  ctx.beginPath();
  ctx.arc(x, y - 24, 22.5, Math.PI, 0);
  ctx.quadraticCurveTo(x + 14, y - 36, x + 2, y - 31);
  ctx.quadraticCurveTo(x - 10, y - 36, x - 22.5, y - 24);
  ctx.closePath();
  ctx.fill();
}

function drawCaughtBadge(ctx, customer) {
  const bx = customer.x + customer.radius + 5;
  const by = customer.y - customer.radius - 5;

  ctx.fillStyle = "#FF6B6B";
  ctx.beginPath();
  ctx.arc(bx, by, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(customer.caught, bx, by);
}
