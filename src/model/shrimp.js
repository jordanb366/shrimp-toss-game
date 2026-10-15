import { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, FRICTION } from "../config.js";

// Shrimp class
export class Shrimp {
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
      this.y > CANVAS_HEIGHT + 50 ||
      this.x < -50 ||
      this.x > CANVAS_WIDTH + 50
    ) {
      this.active = false;
    }
  }

  checkCollision(customer) {
    const dx = this.x - customer.x;
    const dy = this.y - customer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + customer.radius;
  }
}
