import { readString } from "@shared/buffer-util";
import { MessageType } from "@shared/message";
import type { ObjectId, RoomId, SessionId } from "@shared/types";
import type React from "react";
import { Ellipsis } from "./Ellipsis";
import { Member } from "./Member";
import { WebSocketConnection } from "./websocket";

type Canvas = HTMLCanvasElement;
type Context = CanvasRenderingContext2D;

export interface Dragging {
  sessionId: SessionId | null;
}

interface DraggingData {
  startMouseX: number;
  startMouseY: number;
}

export type Status = "connected" | "disconnected";

export class App {
  canvas: Canvas;
  context: Context;
  draggingData: DraggingData | null = null;
  wsConnection: WebSocketConnection = new WebSocketConnection();

  readonly objects: Ellipsis[] = [];
  readonly members: Member[] = [];

  constructor(canvasEl: Canvas) {
    this.canvas = canvasEl;
    const c = canvasEl.getContext("2d");
    if (c === null) throw new Error("Failed to initialize canvas");
    this.context = c;
  }

  async startApp(
    roomId: RoomId,
    statusChanged: (status: Status) => void,
    memberChanged: (count: number) => void,
    useNode = false,
  ): Promise<void> {
    await this.wsConnection.connect(
      roomId,
      () => statusChanged("disconnected"),
      useNode,
    );

    setInterval(() => this.draw(), 10);

    const buffer = new ArrayBuffer(5);
    const view = new DataView(buffer);
    view.setUint8(0, MessageType.Client.JOIN);
    this.wsConnection.sendMessage(buffer);

    this.wsConnection.addOnMessageCallback((message) => {
      const data = new DataView(message);
      const type = data.getUint8(0);

      switch (type) {
        case MessageType.Server.READY: {
          const sessionId = data.getUint8(1);
          console.log(`READY session ID: ${sessionId}`);
          statusChanged("connected");
          break;
        }
        case MessageType.Server.CURSOR: {
          const sessionId = data.getUint8(1);
          const x = data.getInt16(2);
          const y = data.getInt16(4);
          this.onMoveMemberCursor(sessionId as SessionId, x, y);
          break;
        }
        case MessageType.Server.OBJ: {
          const objId = data.getUint8(1) as ObjectId;
          const x = data.getInt16(2);
          const y = data.getInt16(4);
          const radius = data.getUint16(6);
          const color = readString(data.buffer, 8, 16);

          this.addObject(new Ellipsis(objId, x, y, radius, color));
          break;
        }
        case MessageType.Server.OBJ_MOVE: {
          const objId = data.getUint8(1) as ObjectId;
          const x = data.getInt16(2);
          const y = data.getInt16(4);
          const theta = data.getFloat32(6);
          const stretch = data.getFloat32(10);
          this.onObjectMoved(objId, x, y, theta, stretch);
          break;
        }
        case MessageType.Server.DOWN:
        case MessageType.Server.UP:
        case MessageType.Server.DRAG: {
          break;
        }
        case MessageType.Server.MEMBER:
        case MessageType.Server.JOINED: {
          const id = data.getUint8(1);
          console.log(`JOINED: ${id}`);
          this.addMember(id as SessionId);
          memberChanged(this.members.length + 1);
          break;
        }
        case MessageType.Server.QUIT: {
          const id = data.getUint8(1);
          console.log(`QUIT: ${id}`);
          this.removeMember(id as SessionId);
          memberChanged(this.members.length + 1);
          break;
        }
        case MessageType.Server.ERROR: {
          console.log(`ERROR: ${readString(data.buffer, 1, 64)}`);
          break;
        }
        default:
          console.log(`UNKNOWN: ${type}`);
      }
    });
  }

  addObject(obj: Ellipsis): void {
    this.objects.push(obj);
    this.objects.sort((a, b) => a.id - b.id);
  }

  onPointerDown(e: React.PointerEvent<HTMLCanvasElement>): void {
    if (e.button !== 0) return;

    this.canvas.setPointerCapture(e.pointerId);

    const bound = this.canvas.getBoundingClientRect();
    const x = e.clientX - bound.left;
    const y = e.clientY - bound.top;
    this.draggingData = {
      startMouseX: x,
      startMouseY: y,
    };

    const view = new DataView(new ArrayBuffer(5));
    view.setUint8(0, MessageType.Client.DOWN);
    view.setInt16(1, x);
    view.setInt16(3, y);

    this.wsConnection.sendMessage(view.buffer);
  }

  onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    const bound = this.canvas.getBoundingClientRect();
    const x = e.clientX - bound.left;
    const y = e.clientY - bound.top;

    const view = new DataView(new ArrayBuffer(5));
    view.setUint8(0, MessageType.Client.CURSOR);
    view.setInt16(1, x);
    view.setInt16(3, y);

    this.wsConnection.sendMessage(view.buffer);

    if (e.buttons === 1 && this.draggingData !== null) {
      const dx = e.clientX - bound.left - this.draggingData.startMouseX;
      const dy = e.clientY - bound.top - this.draggingData.startMouseY;

      const view = new DataView(new ArrayBuffer(5));
      view.setUint8(0, MessageType.Client.DRAG);
      view.setInt16(1, dx);
      view.setInt16(3, dy);

      this.wsConnection.sendMessage(view.buffer);
    }
  };

  onPointerUp(e: React.PointerEvent<HTMLCanvasElement>): void {
    this.canvas.releasePointerCapture(e.pointerId);
    this.draggingData = null;

    const view = new DataView(new ArrayBuffer(2));
    view.setUint8(0, MessageType.Client.UP);

    this.wsConnection.sendMessage(view.buffer);
  }

  onObjectMoved(
    objectId: ObjectId,
    x: number,
    y: number,
    theta: number,
    stretch: number,
  ): void {
    const obj = this.objects.find((obj) => obj.id === objectId);
    if (obj === undefined) return;
    obj.x = x;
    obj.y = y;
    obj.theta = theta;
    obj.stretch = stretch;
  }

  addMember = (id: SessionId): void => {
    this.members.push(new Member(id));
  };

  removeMember = (id: SessionId): void => {
    const index = this.members.findIndex((member) => member.id === id);
    if (index > -1) {
      this.members.splice(index, 1);
    }
  };

  onMoveMemberCursor = (id: SessionId, x: number, y: number): void => {
    const member = this.members.find((member) => member.id === id);
    if (member === undefined) return;
    member.cursorX = x;
    member.cursorY = y;
  };

  onDownByMember = (sessionId: SessionId): void => {};

  onUpByMember = (id: SessionId): void => {};

  draw = (): void => {
    this.clear();
    this.objects.forEach((obj) => obj.draw(this.context));
    this.members.forEach((member) => member.draw(this.context));
  };

  clear = (): void => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
}
