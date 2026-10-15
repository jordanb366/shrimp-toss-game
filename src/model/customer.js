// Customer class (catch zone)
export class Customer {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.caught = 0;
    this.catchAnimation = 0;
  }

  update() {
    if (this.catchAnimation > 0) {
      this.catchAnimation -= 0.05;
    }
  }

  recordCatch() {
    this.caught++;
    this.catchAnimation = 1;
  }
}
