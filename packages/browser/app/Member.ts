import type { SessionId } from "~shared/types";

export class Member {
  id: SessionId;
  cursorX: number | null = null;
  cursorY: number | null = null;

  constructor(id: SessionId) {
    this.id = id;
  }

  draw(context: CanvasRenderingContext2D): void {
    if (this.cursorX === null || this.cursorY === null) return;

    context.beginPath();
    context.arc(this.cursorX, this.cursorY, 5, 0, 2 * Math.PI, false);
    context.closePath();
    context.fillStyle = "gray";
    context.fill();
  }
}
