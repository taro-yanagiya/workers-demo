import { MessageType } from "shared/src/message";
import { SessionId } from "shared/src/types";
import { Ellipsis } from "./Ellipsis";
import { generate } from "./objects-generator";
import { Room } from "./Room";

const OBJ_COUNT = 10;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

const MIN_RADIUS = 15;
const MAX_RADIUS = 100;

export interface Dragging {
  sessionId: SessionId;
  originX: number;
  originY: number;
  dx: number;
  dy: number;
}

type DraggingData = {
  startMouseX: number;
  startMouseY: number;
  obj: Ellipsis;
};

export class Canvas {
  room: Room;
  objects: Ellipsis[] = generate(
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    MIN_RADIUS,
    MAX_RADIUS,
    OBJ_COUNT,
  );
  draggingData: Map<SessionId, DraggingData> = new Map();

  constructor(room: Room) {
    this.room = room;
  }

  onMouseDown(sessionId: SessionId, x: number, y: number): void {
    const obj = this.objects
      .slice()
      .reverse()
      .find((obj) => obj.isHover(x, y));
    if (obj === undefined) return;

    obj.onMouseDown({
      sessionId,
      originX: x,
      originY: y,
      dx: 0,
      dy: 0,
    });

    this.draggingData.set(sessionId, {
      startMouseX: x,
      startMouseY: y,
      obj,
    });
  }

  onMouseMove(sessionId: SessionId, x: number, y: number): void {}

  onMouseDrag(sessionId: SessionId, dx: number, dy: number): void {
    const dragging = this.draggingData.get(sessionId);

    if (dragging !== undefined) {
      dragging.obj.onMouseDrag(sessionId, dx, dy);

      const view = new DataView(new ArrayBuffer(14));
      view.setUint8(0, MessageType.Server.OBJ_MOVE);
      view.setUint8(1, dragging.obj.id);
      view.setInt16(2, dragging.obj.actualX);
      view.setInt16(4, dragging.obj.actualY);
      view.setFloat32(6, dragging.obj.theta);
      view.setFloat32(10, dragging.obj.stretch);
      this.room.broadcast(view.buffer, null);
    }
  }

  onMouseUp(sessionId: SessionId): void {
    const dragging = this.draggingData.get(sessionId);

    if (dragging !== undefined) {
      dragging.obj.onMouseUp(sessionId);
      this.draggingData.delete(sessionId);

      const view = new DataView(new ArrayBuffer(14));
      view.setUint8(0, MessageType.Server.OBJ_MOVE);
      view.setUint8(1, dragging.obj.id);
      view.setInt16(2, dragging.obj.actualX);
      view.setInt16(4, dragging.obj.actualY);
      view.setFloat32(6, dragging.obj.theta);
      view.setFloat32(10, dragging.obj.stretch);
      this.room.broadcast(view.buffer, null);
    }
  }
}
