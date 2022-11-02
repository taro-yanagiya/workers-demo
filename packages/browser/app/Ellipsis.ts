import type { ObjectId } from "@shared/types";

export class Ellipsis {
  id: ObjectId;
  x: number;
  y: number;
  radius: number;
  color: string;
  stretch: number = 0;
  theta: number = 0;
  stretchingFactor: number;

  constructor(
    id: ObjectId,
    x: number,
    y: number,
    radius: number,
    color: string,
    stretchingFactor: number = 0.05,
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.stretchingFactor = stretchingFactor;
  }

  get a(): number {
    return this.radius + this.stretch * this.stretchingFactor;
  }

  get b(): number {
    return (
      this.radius ** 2 / (this.radius + this.stretch * this.stretchingFactor)
    );
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.ellipse(this.x, this.y, this.a, this.b, this.theta, 0, 2 * Math.PI);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
  }

  isHover(x: number, y: number): boolean {
    const theta = 0;
    return (
      ((x - this.x) * Math.cos(theta) + (y - this.y) * Math.sin(theta)) ** 2 /
        this.a ** 2 +
        (-(x - this.x) * Math.sin(theta) + (y - this.y) * Math.cos(theta)) **
          2 /
          this.b ** 2 <=
      1
    );
  }
}
