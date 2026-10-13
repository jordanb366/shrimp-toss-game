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
        
        // Shrimp body - curved
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 1.3, this.radius * 0.8, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Shrimp tail
        ctx.fillStyle = '#E84C3D';
        ctx.beginPath();
        ctx.ellipse(this.x + 12, this.y + 8, 6, 4, Math.PI / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Antennae
        ctx.strokeStyle = '#FF6B6B';
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
        ctx.strokeStyle = '#E84C3D';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - 8 + i * 8, this.y + 4);
            ctx.lineTo(this.x - 8 + i * 8, this.y + 10);
            ctx.stroke();
        }
        
        // Shine/highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.radius + 8, this.radius + 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow if just caught
        if (this.catchAnimation > 0) {
            ctx.fillStyle = `rgba(255, 215, 0, ${this.catchAnimation * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + this.catchAnimation * 10, 0, Math.PI * 2);
            ctx.fill();
            this.catchAnimation -= 0.05;
        }

        // Body
        ctx.fillStyle = '#4A90E2';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2E5C8A';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Head (face)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 20, this.radius - 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#CCA500';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Eyes (with whites and pupils)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - 7, this.y - 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 7, this.y - 22, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 7, this.y - 22, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 7, this.y - 22, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 23, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - 23, 1, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 14, 7, 0, Math.PI);
        ctx.stroke();

        // Caught count badge
        if (this.caught > 0) {
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.arc(this.x + this.radius - 5, this.y - this.radius + 5, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.caught, this.x + this.radius - 5, this.y - this.radius + 5);
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
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(COOK_X, COOK_Y + 25, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Chef hat - white chef hat style
    ctx.fillStyle = '#fff';
    ctx.fillRect(COOK_X - 22, COOK_Y - 45, 44, 18);
    ctx.fillStyle = '#333';
    ctx.fillRect(COOK_X - 25, COOK_Y - 27, 50, 8);
    
    // Body/apron
    ctx.fillStyle = '#fff';
    ctx.fillRect(COOK_X - 18, COOK_Y - 10, 36, 35);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(COOK_X - 18, COOK_Y - 10, 36, 35);
    
    // Apron strings
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(COOK_X - 10, COOK_Y - 10);
    ctx.lineTo(COOK_X - 10, COOK_Y + 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(COOK_X + 10, COOK_Y - 10);
    ctx.lineTo(COOK_X + 10, COOK_Y + 20);
    ctx.stroke();
    
    // Face
    ctx.fillStyle = '#FFD7A8';
    ctx.beginPath();
    ctx.arc(COOK_X, COOK_Y - 15, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(COOK_X - 8, COOK_Y - 18, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(COOK_X + 8, COOK_Y - 18, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(COOK_X - 8, COOK_Y - 18, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(COOK_X + 8, COOK_Y - 18, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(COOK_X - 7, COOK_Y - 19, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(COOK_X + 9, COOK_Y - 19, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(COOK_X, COOK_Y - 8, 6, 0, Math.PI);
    ctx.stroke();
    
    // Nose
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.arc(COOK_X, COOK_Y - 14, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Draw aim line with power indicator
function drawAimLine() {
    if (gameState.isDragging) {
        ctx.save();
        
        // Calculate drag distance
        const dx = gameState.dragStart.x - gameState.aimLine.x2;
        const dy = gameState.dragStart.y - gameState.aimLine.y2;
        const dragDistance = Math.sqrt(dx * dx + dy * dy);
        const power = Math.min(dragDistance / 30, 1); // Max power at 30px drag
        
        // Draw aim line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Power fill
        ctx.fillStyle = `rgba(255, ${Math.floor(100 + power * 155)}, 100, 0.8)`;
        ctx.fillRect(barX, barY, barWidth * power, barHeight);
        
        // Power text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Power: ${Math.floor(power * 100)}%`, gameState.aimLine.x1, barY - 10);
        
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

        // Calculate velocity - reaches max power at 30px drag distance
        const vx = (gameState.dragStart.x - x) * 0.4;
        const vy = (gameState.dragStart.y - y) * 0.4;

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

        const vx = (gameState.dragStart.x - x) * 0.4;
        const vy = (gameState.dragStart.y - y) * 0.4;

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
