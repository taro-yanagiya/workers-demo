import { MessageType } from "shared/src/message";
import { ObjectId, SessionId } from "shared/src/types";
import { Ellipsis } from "./Ellipsis";
import { Room } from "./Room";

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
  objects: Ellipsis[] = [
    new Ellipsis(this, 0 as ObjectId, 50, 50, 50, "blue"),
    new Ellipsis(this, 1 as ObjectId, 94, 66, 50, "red"),
    new Ellipsis(this, 2 as ObjectId, 560, 310, 25, "yellow"),
  ];
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
