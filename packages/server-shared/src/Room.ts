import { writeString } from "shared/src/buffer-util";
import { MessageType } from "shared/src/message";
import { SessionId } from "shared/src/types";
import { Canvas } from "./Canvas";
import { IWebSocket } from "./IWebSocket";
import { Session } from "./Session";

const MAX_SESSIONS = 256;

export class Room {
  canvas: Canvas = new Canvas(this);
  sessions: Map<number, Session> = new Map();

  onConnected(webSocket: IWebSocket): void {
    webSocket.accept();
    const newId = this.issueNewSessionId();
    if (newId === null) {
      const buffer = createError("session max limit");
      webSocket.send(buffer);
      return;
    }

    const newSession = new Session(newId, webSocket, this);
    this.sessions.forEach((s) => {
      if (!s.ready) return;
      const data = new Uint8Array(new ArrayBuffer(2));
      data[0] = MessageType.Server.MEMBER;
      data[1] = s.id;
      newSession.sendMessage(data.buffer);
    });
    this.sessions.set(newId, newSession);
    console.log(`New session: ${newSession.id}.`);
  }

  onDisconnected(id: SessionId): void {
    console.log(`session ${id} is quitted.`);
    this.sessions.delete(id);
  }

  /**
   * Broadcast a message to all members of the room except the specified session.
   * @param message a websocket message.
   * @param sessionId a session to which the message is not sent.
   * @returns
   */
  broadcast(message: ArrayBuffer, sessionId: SessionId | null): void {
    this.sessions.forEach((session) => {
      if (sessionId !== null && session.id === sessionId) {
        return;
      }

      if (session.ready) {
        session.sendMessage(message);
      } else {
        // This session hasn't sent the initial user info message yet, so we're not sending them
        // messages yet (no secret lurking!). Queue the message to be sent later.
        console.log(
          `Session ${session.id} is not prepared yet. pushed the message to pending list.`,
        );
        session.blockedMessages.push(message);
      }
    });

    this.sessions.forEach((session) => {
      if (!session.quit) return;
      if (session.ready) {
        const data = new Uint8Array(new ArrayBuffer(2));
        data[0] = MessageType.Server.QUIT;
        data[1] = session.id;
        this.broadcast(data.buffer, session.id);
      }
      this.sessions.delete(session.id);
    });
  }

  issueNewSessionId(): SessionId | null {
    for (let i = 0; i < MAX_SESSIONS; i++) {
      if (this.sessions.get(i) === undefined) {
        return i as SessionId;
      }
    }

    return null;
  }
}

export const createError = (err: string): ArrayBuffer => {
  const view = new DataView(new ArrayBuffer(1 + 64));
  view.setUint8(0, MessageType.Server.ERROR);
  writeString(err, view.buffer, 1, 64);
  return view.buffer;
};
