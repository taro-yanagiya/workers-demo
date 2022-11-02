import type { RoomId } from "@shared/types";
import type { FC } from "react";
import { useEffect, useRef } from "react";
import { App } from "./app";

interface Props {
  width: number;
  height: number;
  roomId: RoomId;
  useNode?: boolean;
}

const Canvas: FC<Props> = ({ width, height, roomId, useNode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<App | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas !== null) {
      void (async () => {
        appRef.current = new App(canvas);
        await appRef.current.startApp(roomId, useNode);
      })();
    }
  }, [roomId, useNode]);

  return (
    <canvas
      width={width}
      height={height}
      ref={canvasRef}
      onPointerDown={(e) => appRef?.current?.onPointerDown(e)}
      onPointerMove={(e) => appRef?.current?.onPointerMove(e)}
      onPointerUp={(e) => appRef?.current?.onPointerUp(e)}
    />
  );
};

export default Canvas;
