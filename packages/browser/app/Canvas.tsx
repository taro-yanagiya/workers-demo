import type { RoomId } from "~shared/types";
import type { FC } from "react";
import { memo, useEffect, useRef } from "react";
import type { Status } from "./app";
import { App } from "./app";

interface Props {
  width: number;
  height: number;
  roomId: RoomId;
  useNode?: boolean;
  onStatusChanged: (status: Status) => void;
  onMemberChanged: (count: number) => void;
}

const Canvas: FC<Props> = memo(function Canvas({
  width,
  height,
  roomId,
  useNode,
  onStatusChanged,
  onMemberChanged,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<App | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas !== null) {
      void (async () => {
        appRef.current = new App(canvas);
        await appRef.current.startApp(
          roomId,
          onStatusChanged,
          onMemberChanged,
          useNode,
        );
      })();
    }
  }, [onMemberChanged, onStatusChanged, roomId, useNode]);

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
});

export default Canvas;
