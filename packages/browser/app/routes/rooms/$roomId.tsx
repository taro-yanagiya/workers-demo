import { useParams } from "@remix-run/react";
import type { RoomId } from "@shared/types";
import type { FC } from "react";
import Canvas from "~/Canvas";

const Room: FC = () => {
  const { roomId } = useParams();

  if (roomId === undefined) {
    return <p>Error: Please specify room ID.</p>;
  }

  return (
    <div>
      <h3>Cloudflare Workers</h3>
      <Canvas
        width={800}
        height={500}
        roomId={roomId as RoomId}
        useNode={false}
      />
      <h3>Node.js</h3>
      <Canvas
        width={800}
        height={500}
        roomId={roomId as RoomId}
        useNode={true}
      />
    </div>
  );
};

export default Room;
