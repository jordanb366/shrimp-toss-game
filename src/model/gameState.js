import { CANVAS_WIDTH } from "../config.js";
import { Customer } from "./customer.js";
import { Shrimp } from "./shrimp.js";

const CHEF_Y = 470;
const GRAB_RADIUS = 50;
const THROW_SCALE = 0.4;

export function createGameState() {
  return {
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
    lastTime: Date.now(),
  };
}

export function resetRound(state) {
  state.score = 0;
  state.shrimps = [];
  state.customers = [];
  state.chefX = CANVAS_WIDTH / 2;
  state.chefY = CHEF_Y;
  state.gameOver = false;
  state.timeRemaining = state.selectedTime;
  state.lastTime = Date.now();

  // Customers seated on the opposite side of the grill (front/top)
  state.customers.push(new Customer(150, 120, 35)); // Left front
  state.customers.push(new Customer(400, 100, 35)); // Center front
  state.customers.push(new Customer(650, 120, 35)); // Right front
}

// Returns true when this tick ran out the clock
export function tickTimer(state, now) {
  const deltaTime = (now - state.lastTime) / 1000;
  state.lastTime = now;

  state.timeRemaining -= deltaTime;
  if (state.timeRemaining <= 0) {
    state.timeRemaining = 0;
    state.gameOver = true;
    state.isGameRunning = false;
    return true;
  }
  return false;
}

export function stepShrimps(state) {
  state.shrimps = state.shrimps.filter((shrimp) => {
    shrimp.update();

    for (const customer of state.customers) {
      if (shrimp.checkCollision(customer)) {
        customer.recordCatch();
        state.score += 10 * customer.caught;
        shrimp.active = false;
        break;
      }
    }

    return shrimp.active;
  });
}

// Returns true if the press grabbed the spatula
export function startDrag(state, x, y) {
  const dx = x - state.chefX;
  const dy = y - state.chefY;
  if (Math.sqrt(dx * dx + dy * dy) >= GRAB_RADIUS) {
    return false;
  }

  state.isDragging = true;
  state.dragStart = { x, y };
  state.aimLine = { x1: state.chefX, y1: state.chefY, x2: x, y2: y };
  return true;
}

export function updateAim(state, x, y) {
  state.aimLine = { x1: state.chefX, y1: state.chefY, x2: x, y2: y };
}

export function releaseShrimp(state, x, y) {
  const vx = (state.dragStart.x - x) * THROW_SCALE;
  const vy = (state.dragStart.y - y) * THROW_SCALE;
  state.shrimps.push(new Shrimp(state.chefX, state.chefY, vx, vy));
  state.isDragging = false;
}
