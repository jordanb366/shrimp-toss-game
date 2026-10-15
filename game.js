// Game Constants
const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const resetBtn = document.getElementById("resetBtn");
const menuBtn = document.getElementById("menuBtn");
const startBtn = document.getElementById("startBtn");
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

// Verify elements exist
if (!canvas || !ctx) {
  console.error("Canvas not found!");
}

// Game State
let gameState = {
  score: 0,
  shrimps: [],
  customers: [],
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  aimLine: { x1: 0, y1: 0, x2: 0, y2: 0 },
  chefX: 0,
  chefY: 0,
  isGameRunning: false,
  timeRemaining: 60,
  totalTime: 60,
  gameOver: false,
  selectedTime: 60,
  lastTime: Date.now()
};

// Physics
const GRAVITY = 0.3;
const FRICTION = 0.99;

// Shrimp class
class Shrimp {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 8;
    this.active = true;
  }

  update() {
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= FRICTION;

    // Remove if out of bounds
    if (
      this.y > canvas.height + 50 ||
      this.x < -50 ||
      this.x > canvas.width + 50
    ) {
      this.active = false;
    }
  }

  draw() {
    ctx.save();

    // Shrimp body - curved
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.ellipse(
      this.x,
      this.y,
      this.radius * 1.3,
      this.radius * 0.8,
      Math.PI / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Shrimp tail
    ctx.fillStyle = "#E84C3D";
    ctx.beginPath();
    ctx.ellipse(this.x + 12, this.y + 8, 6, 4, Math.PI / 3, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - 6, this.y - 6);
    ctx.quadraticCurveTo(this.x - 12, this.y - 15, this.x - 10, this.y - 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + 6, this.y - 6);
    ctx.quadraticCurveTo(this.x + 12, this.y - 15, this.x + 10, this.y - 22);
    ctx.stroke();

    // Legs (simple segments)
    ctx.strokeStyle = "#E84C3D";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(this.x - 8 + i * 8, this.y + 4);
      ctx.lineTo(this.x - 8 + i * 8, this.y + 10);
      ctx.stroke();
    }

    // Shine/highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.ellipse(this.x - 4, this.y - 3, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  checkCollision(customer) {
    const dx = this.x - customer.x;
    const dy = this.y - customer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + customer.radius;
  }
}

// Customer class (catch zone)
class Customer {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.caught = 0;
    this.catchAnimation = 0;
  }

  draw() {
    ctx.save();

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.ellipse(
      this.x,
      this.y + this.radius + 8,
      this.radius + 10,
      4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Draw glow if just caught
    if (this.catchAnimation > 0) {
      ctx.fillStyle = `rgba(255, 215, 0, ${this.catchAnimation * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        this.radius + this.catchAnimation * 10,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      this.catchAnimation -= 0.05;
    }

    // Body
    ctx.fillStyle = "#4A90E2";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2E5C8A";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Head (face)
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(this.x, this.y - 20, this.radius - 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#CCA500";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eyes (with whites and pupils)
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x - 7, this.y - 22, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 7, this.y - 22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(this.x - 7, this.y - 22, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 7, this.y - 22, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x - 6, this.y - 23, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 8, this.y - 23, 1, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y - 14, 7, 0, Math.PI);
    ctx.stroke();

    // Caught count badge
    if (this.caught > 0) {
      ctx.fillStyle = "#FF6B6B";
      ctx.beginPath();
      ctx.arc(
        this.x + this.radius - 5,
        this.y - this.radius + 5,
        10,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        this.caught,
        this.x + this.radius - 5,
        this.y - this.radius + 5,
      );
    }

    ctx.restore();
  }
}

// Initialize game
function initGame() {
  gameState.score = 0;
  gameState.shrimps = [];
  gameState.customers = [];
  gameState.chefX = canvas.width / 2;
  gameState.chefY = 470;
  gameState.gameOver = false;
  gameState.timeRemaining = gameState.selectedTime;
  gameState.lastTime = Date.now();
  scoreDisplay.textContent = "0";
  timerDisplay.textContent = gameState.selectedTime;

  // Create customers seated on the opposite side of the grill (front/top)
  gameState.customers.push(new Customer(150, 120, 35)); // Left front
  gameState.customers.push(new Customer(400, 100, 35)); // Center front
  gameState.customers.push(new Customer(650, 120, 35)); // Right front
}

// Show game over overlay
function showGameOver() {
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-content">
      <h2>Time's Up! 🎯</h2>
      <p class="final-score">Final Score: <span>${gameState.score}</span></p>
      <div class="game-over-buttons">
        <button class="game-over-btn" onclick="location.reload()">Play Again</button>
        <button class="game-over-btn secondary" onclick="goToMenu()">Back to Menu</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function goToMenu() {
  gameState.isGameRunning = false;
  gameState.gameOver = false;
  gameScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
  const overlay = document.querySelector('.game-over-overlay');
  if (overlay) overlay.remove();
}

// Draw the restaurant background and scene
function drawRestaurantBackground() {
  if (!ctx || !canvas) return;
  
  // Floor (dark wood)
  ctx.fillStyle = "#3D2817";
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

  // Floor shine/grain
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.width; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, canvas.height - 60);
    ctx.lineTo(i + 60, canvas.height);
    ctx.stroke();
  }

  // Walls - back wall
  ctx.fillStyle = "#2A1810";
  ctx.fillRect(0, 0, canvas.width, canvas.height - 60);

  // Wall texture - horizontal lines (wood paneling)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.height - 60; i += 25) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Wall texture - vertical lines (wood grain)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height - 60);
    ctx.stroke();
  }

  // Left wall accent
  const leftWallGradient = ctx.createLinearGradient(0, 0, 80, 0);
  leftWallGradient.addColorStop(0, "rgba(0, 0, 0, 0.4)");
  leftWallGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = leftWallGradient;
  ctx.fillRect(0, 0, 80, canvas.height - 60);

  // Right wall accent
  const rightWallGradient = ctx.createLinearGradient(
    canvas.width - 80,
    0,
    canvas.width,
    0,
  );
  rightWallGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  rightWallGradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = rightWallGradient;
  ctx.fillRect(canvas.width - 80, 0, 80, canvas.height - 60);

  // Ceiling/Top area - darker
  ctx.fillStyle = "#1a0f0a";
  ctx.fillRect(0, 0, canvas.width, 30);

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
  ctx.fillText("鉄板焼き", canvas.width / 2, 120);
  ctx.globalAlpha = 1.0;

  // Restaurant counter background
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 320, canvas.width, 40);

  // Red accent stripe (typical hibachi restaurant style)
  ctx.fillStyle = "#CC0000";
  ctx.fillRect(0, 325, canvas.width, 3);
}

// Draw the teppanyaki/hibachi grill
function drawGrill() {
  if (!ctx || !canvas) return;
  
  ctx.save();

  // Grill surface (flat iron cooktop)
  const grillX = canvas.width / 2;
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

// Draw cook/toss point (now behind the grill)
function drawCook() {
  if (!ctx || !canvas) return;
  
  ctx.save();

  const chefX = gameState.chefX;
  const chefY = gameState.chefY;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(chefX, chefY + 90, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chef hat - white chef hat style
  ctx.fillStyle = "#fff";
  ctx.fillRect(chefX - 22, chefY - 45, 44, 18);
  ctx.fillStyle = "#333";
  ctx.fillRect(chefX - 25, chefY - 27, 50, 8);

  // Body/apron
  ctx.fillStyle = "#fff";
  ctx.fillRect(chefX - 18, chefY - 10, 36, 55);
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 2;
  ctx.strokeRect(chefX - 18, chefY - 10, 36, 55);

  // Apron strings
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chefX - 10, chefY - 10);
  ctx.lineTo(chefX - 10, chefY + 40);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(chefX + 10, chefY - 10);
  ctx.lineTo(chefX + 10, chefY + 40);
  ctx.stroke();

  // Face
  ctx.fillStyle = "#FFD7A8";
  ctx.beginPath();
  ctx.arc(chefX, chefY - 15, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#D4A574";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(chefX - 8, chefY - 18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(chefX + 8, chefY - 18, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(chefX - 8, chefY - 18, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(chefX + 8, chefY - 18, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(chefX - 7, chefY - 19, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(chefX + 9, chefY - 19, 1, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(chefX, chefY - 8, 6, 0, Math.PI);
  ctx.stroke();

  // Nose
  ctx.fillStyle = "#D4A574";
  ctx.beginPath();
  ctx.arc(chefX, chefY - 14, 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw spatula
  const spatulaAngle = gameState.isDragging
    ? Math.atan2(
        gameState.aimLine.y2 - gameState.aimLine.y1,
        gameState.aimLine.x2 - gameState.aimLine.x1,
      ) -
      Math.PI / 4
    : -Math.PI / 6;

  ctx.translate(chefX + 8, chefY - 5);
  ctx.rotate(spatulaAngle);

  // Spatula handle
  ctx.strokeStyle = "#8B4513";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(35, 0);
  ctx.stroke();

  // Spatula head (metal part)
  ctx.fillStyle = "#C0C0C0";
  ctx.fillRect(30, -10, 20, 20);
  ctx.strokeStyle = "#A9A9A9";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, -10, 20, 20);

  // Spatula shine
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillRect(33, -7, 8, 4);

  // Draw shrimp on spatula (only when not dragging/tossing)
  if (!gameState.isDragging) {
    const shrimpX = 40;
    const shrimpY = -8;

    // Shrimp body - curved
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.ellipse(shrimpX, shrimpY, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shrimp tail
    ctx.fillStyle = "#E84C3D";
    ctx.beginPath();
    ctx.ellipse(shrimpX + 8, shrimpY + 4, 4, 2.5, Math.PI / 3, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
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

    // Shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.ellipse(shrimpX - 2, shrimpY - 2, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw seated customer
function drawSeatedCustomer(customer) {
  if (!ctx || !canvas) return;
  
  ctx.save();

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.ellipse(
    customer.x,
    customer.y + customer.radius + 25,
    customer.radius + 15,
    5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Draw glow if just caught
  if (customer.catchAnimation > 0) {
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
    customer.catchAnimation -= 0.05;
  }

  // Chair (wooden)
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(customer.x - 20, customer.y + 15, 40, 25);
  ctx.fillStyle = "#654321";
  ctx.fillRect(customer.x - 22, customer.y + 38, 44, 6);

  // Chair back
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(customer.x - 18, customer.y - 5, 36, 20);
  ctx.strokeStyle = "#654321";
  ctx.lineWidth = 2;
  ctx.strokeRect(customer.x - 18, customer.y - 5, 36, 20);

  // Body (seated)
  ctx.fillStyle = "#4A90E2";
  ctx.beginPath();
  ctx.ellipse(
    customer.x,
    customer.y,
    customer.radius - 2,
    customer.radius,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#2E5C8A";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Head (face)
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(customer.x, customer.y - 20, customer.radius - 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#CCA500";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes (with whites and pupils)
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(customer.x - 7, customer.y - 22, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(customer.x + 7, customer.y - 22, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(customer.x - 7, customer.y - 22, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(customer.x + 7, customer.y - 22, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(customer.x - 6, customer.y - 23, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(customer.x + 8, customer.y - 23, 1, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(customer.x, customer.y - 14, 7, 0, Math.PI);
  ctx.stroke();

  // Caught count badge
  if (customer.caught > 0) {
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.arc(
      customer.x + customer.radius + 5,
      customer.y - customer.radius - 5,
      10,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      customer.caught,
      customer.x + customer.radius + 5,
      customer.y - customer.radius - 5,
    );
  }

  ctx.restore();
}

// Draw aim line with power indicator
function drawAimLine() {
  if (!ctx || !canvas) return;
  
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

// Update game
function update() {
  // Update timer
  if (gameState.isGameRunning && !gameState.gameOver) {
    const now = Date.now();
    const deltaTime = (now - gameState.lastTime) / 1000;
    gameState.lastTime = now;
    
    gameState.timeRemaining -= deltaTime;
    if (gameState.timeRemaining <= 0) {
      gameState.timeRemaining = 0;
      gameState.gameOver = true;
      gameState.isGameRunning = false;
      showGameOver();
    }
    
    // Update timer display
    timerDisplay.textContent = Math.ceil(gameState.timeRemaining);
    
    // Add warning animation when time is low
    const timerElement = timerDisplay.parentElement;
    if (gameState.timeRemaining <= 10) {
      timerElement.classList.add('warning');
    } else {
      timerElement.classList.remove('warning');
    }
  }

  // Update shrimps
  gameState.shrimps = gameState.shrimps.filter((shrimp) => {
    shrimp.update();

    // Check collision with customers
    for (let customer of gameState.customers) {
      if (shrimp.checkCollision(customer)) {
        customer.caught++;
        customer.catchAnimation = 1;
        gameState.score += 10 * customer.caught;
        scoreDisplay.textContent = gameState.score;
        shrimp.active = false;
        break;
      }
    }

    return shrimp.active;
  });
}

// Draw game
function draw() {
  if (!ctx || !canvas) return;
  
  // Draw restaurant background first
  drawRestaurantBackground();

  // Draw seated customers (on far side of grill)
  for (let customer of gameState.customers) {
    drawSeatedCustomer(customer);
  }

  // Draw grill in the middle
  drawGrill();

  // Draw chef behind grill
  drawCook();

  // Draw shrimps on top
  for (let shrimp of gameState.shrimps) {
    shrimp.draw();
  }

  drawAimLine();
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  if (!gameState.isGameRunning || gameState.gameOver) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Check if clicking near cook
  const dx = x - gameState.chefX;
  const dy = y - gameState.chefY;
  if (Math.sqrt(dx * dx + dy * dy) < 50) {
    gameState.isDragging = true;
    gameState.dragStart = { x, y };
    gameState.aimLine = {
      x1: gameState.chefX,
      y1: gameState.chefY,
      x2: x,
      y2: y,
    };
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (gameState.isDragging) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gameState.aimLine = {
      x1: gameState.chefX,
      y1: gameState.chefY,
      x2: x,
      y2: y,
    };
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (gameState.isDragging) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate velocity - reaches max power at 30px drag distance
    const vx = (gameState.dragStart.x - x) * 0.4;
    const vy = (gameState.dragStart.y - y) * 0.4;

    // Create shrimp
    gameState.shrimps.push(
      new Shrimp(gameState.chefX, gameState.chefY, vx, vy),
    );

    gameState.isDragging = false;
  }
});

// Touch events for mobile
canvas.addEventListener("touchstart", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  const dx = x - gameState.chefX;
  const dy = y - gameState.chefY;
  if (Math.sqrt(dx * dx + dy * dy) < 50) {
    gameState.isDragging = true;
    gameState.dragStart = { x, y };
    gameState.aimLine = {
      x1: gameState.chefX,
      y1: gameState.chefY,
      x2: x,
      y2: y,
    };
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (gameState.isDragging) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    gameState.aimLine = {
      x1: gameState.chefX,
      y1: gameState.chefY,
      x2: x,
      y2: y,
    };
  }
  e.preventDefault();
});

canvas.addEventListener("touchend", (e) => {
  if (gameState.isDragging) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const vx = (gameState.dragStart.x - x) * 0.4;
    const vy = (gameState.dragStart.y - y) * 0.4;

    gameState.shrimps.push(
      new Shrimp(gameState.chefX, gameState.chefY, vx, vy),
    );
    gameState.isDragging = false;
  }
  e.preventDefault();
});

// Menu and Game Controls
startBtn.addEventListener("click", () => {
  gameState.isGameRunning = true;
  menuScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  initGame();
});

resetBtn.addEventListener("click", () => {
  initGame();
});

menuBtn.addEventListener("click", () => {
  goToMenu();
});

// Difficulty selection
document.querySelectorAll('.difficulty-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    gameState.selectedTime = parseInt(e.target.dataset.time);
  });
});

// Start game
gameLoop();
