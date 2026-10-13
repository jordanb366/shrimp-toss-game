// Game Constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');

// Game State
let gameState = {
    score: 0,
    shrimps: [],
    customers: [],
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    aimLine: { x1: 0, y1: 0, x2: 0, y2: 0 }
};

// Physics
const GRAVITY = 0.3;
const FRICTION = 0.99;
const COOK_X = 100;
const COOK_Y = 550;

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
        if (this.y > canvas.height + 50 || this.x < -50 || this.x > canvas.width + 50) {
            this.active = false;
        }
    }

    draw() {
        ctx.save();
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a little shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, 3, 0, Math.PI * 2);
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
        
        // Draw glow if just caught
        if (this.catchAnimation > 0) {
            ctx.fillStyle = `rgba(255, 215, 0, ${this.catchAnimation * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + this.catchAnimation * 10, 0, Math.PI * 2);
            ctx.fill();
            this.catchAnimation -= 0.05;
        }

        // Draw customer body (circle)
        ctx.fillStyle = '#4A90E2';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw face
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 15, this.radius - 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 18, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y - 18, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 10, 6, 0, Math.PI);
        ctx.stroke();

        // Draw caught count
        if (this.caught > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.caught, this.x, this.y + 10);
        }

        ctx.restore();
    }
}

// Initialize game
function initGame() {
    gameState.score = 0;
    gameState.shrimps = [];
    gameState.customers = [];
    scoreDisplay.textContent = '0';

    // Create customers at different positions
    gameState.customers.push(new Customer(150, 400, 35));
    gameState.customers.push(new Customer(400, 350, 35));
    gameState.customers.push(new Customer(650, 380, 35));
    gameState.customers.push(new Customer(250, 200, 35));
    gameState.customers.push(new Customer(550, 220, 35));
}

// Draw cook/toss point
function drawCook() {
    ctx.save();
    // Chef hat
    ctx.fillStyle = '#333';
    ctx.fillRect(COOK_X - 20, COOK_Y - 40, 40, 25);
    ctx.fillStyle = '#fff';
    ctx.fillRect(COOK_X - 15, COOK_Y - 15, 30, 15);
    
    // Face
    ctx.fillStyle = '#FFD7A8';
    ctx.beginPath();
    ctx.arc(COOK_X, COOK_Y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(COOK_X - 6, COOK_Y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(COOK_X + 6, COOK_Y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Draw aim line
function drawAimLine() {
    if (gameState.isDragging) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(gameState.aimLine.x1, gameState.aimLine.y1);
        ctx.lineTo(gameState.aimLine.x2, gameState.aimLine.y2);
        ctx.stroke();
        ctx.restore();
    }
}

// Update game
function update() {
    // Update shrimps
    gameState.shrimps = gameState.shrimps.filter(shrimp => {
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
    // Clear canvas
    ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCook();
    
    // Draw customers
    for (let customer of gameState.customers) {
        customer.draw();
    }

    // Draw shrimps
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
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near cook
    const dx = x - COOK_X;
    const dy = y - COOK_Y;
    if (Math.sqrt(dx * dx + dy * dy) < 50) {
        gameState.isDragging = true;
        gameState.dragStart = { x, y };
        gameState.aimLine = { x1: COOK_X, y1: COOK_Y, x2: x, y2: y };
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (gameState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gameState.aimLine = { x1: COOK_X, y1: COOK_Y, x2: x, y2: y };
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (gameState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate velocity
        const vx = (gameState.dragStart.x - x) * 0.15;
        const vy = (gameState.dragStart.y - y) * 0.15;

        // Create shrimp
        gameState.shrimps.push(new Shrimp(COOK_X, COOK_Y, vx, vy));

        gameState.isDragging = false;
    }
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const dx = x - COOK_X;
    const dy = y - COOK_Y;
    if (Math.sqrt(dx * dx + dy * dy) < 50) {
        gameState.isDragging = true;
        gameState.dragStart = { x, y };
        gameState.aimLine = { x1: COOK_X, y1: COOK_Y, x2: x, y2: y };
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (gameState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        gameState.aimLine = { x1: COOK_X, y1: COOK_Y, x2: x, y2: y };
    }
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    if (gameState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const vx = (gameState.dragStart.x - x) * 0.15;
        const vy = (gameState.dragStart.y - y) * 0.15;

        gameState.shrimps.push(new Shrimp(COOK_X, COOK_Y, vx, vy));
        gameState.isDragging = false;
    }
    e.preventDefault();
});

// Reset button
resetBtn.addEventListener('click', initGame);

// Start game
initGame();
gameLoop();
