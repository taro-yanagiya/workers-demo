import { ObjectId, SessionId } from "shared/src/types";
import { Dragging } from "./Canvas";

export class Ellipsis {
  id: ObjectId;
  originalX: number;
  originalY: number;
  radius: number;
  color: string;
  stretch: number = 0.0;
  theta: number = 0.0;
  stretchingFactor: number;
  private draggings: Dragging[] = [];

  constructor(
    id: ObjectId,
    x: number,
    y: number,
    radius: number,
    color: string,
    stretchingFactor: number = 0.01,
  ) {
    this.id = id;
    this.originalX = x;
    this.originalY = y;
    this.radius = radius;
    this.color = color;
    this.stretchingFactor = stretchingFactor;
  }

  get actualX(): number {
    return this.originalX;
  }

  get actualY(): number {
    return this.originalY;
  }

  get a(): number {
    return this.radius + this.stretch * this.stretchingFactor;
  }

  get b(): number {
    return (
      this.radius ** 2 / (this.radius + this.stretch * this.stretchingFactor)
    );
  }

  isHover(x: number, y: number): boolean {
    return (
      ((x - this.actualX) * Math.cos(this.theta) +
        (y - this.actualY) * Math.sin(this.theta)) **
        2 /
        this.a ** 2 +
        (-(x - this.actualX) * Math.sin(this.theta) +
          (y - this.actualY) * Math.cos(this.theta)) **
          2 /
          this.b ** 2 <=
      1
    );
  }

  onMouseDown(dragging: Dragging): void {
    this.draggings.push(dragging);
  }

  onMouseDrag(sessionId: SessionId, dx: number, dy: number): void {
    const dragging = this.draggings.find((d) => d.sessionId === sessionId);
    if (dragging === undefined) return;
    dragging.dx = dx;
    dragging.dy = dy;

    const draggingsCount = this.draggings.length;
    this.originalX = 0;
    this.originalY = 0;
    this.draggings.forEach((d) => {
      this.originalX += (d.originX + d.dx) / draggingsCount;
      this.originalY += (d.originY + d.dy) / draggingsCount;
    });

    this.updateStretch();
  }

  onMouseUp(sessionId: SessionId): void {
    this.clearDrag(sessionId);
  }

  onMemberQuit(sessionId: SessionId): void {
    this.clearDrag(sessionId);
  }

  clearDrag(sessionId: SessionId): void {
    this.draggings = this.draggings.filter((d) => d.sessionId !== sessionId);

    const draggingsCount = this.draggings.length;
    if (draggingsCount === 0) {
      return;
    }

    this.originalX = 0;
    this.originalY = 0;
    this.draggings.forEach((d) => {
      this.originalX = (d.originX + d.dx) / draggingsCount;
      this.originalY = (d.originY + d.dy) / draggingsCount;
    });

    this.updateStretch();
  }

  updateStretch() {
    const draggingsCount = this.draggings.length;

    if (draggingsCount > 1) {
      const dx = this.draggings[1].dx - this.draggings[0].dx;
      const dy = this.draggings[1].dy - this.draggings[0].dy;

      const mouseDistance = Math.sqrt(dx ** 2 + dy ** 2);
      const theta = Math.atan2(dy, dx);
      this.theta = theta;
      this.stretch = mouseDistance;
    } else {
      this.stretch = 0.0;
    }
  }
}
