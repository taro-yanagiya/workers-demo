/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { FC } from "react";
import { useCallback } from "react";
import type { RoomId } from "~shared/types";

interface Props {
  onRoomIdSubmit: (roomId: RoomId) => void;
}

const Entrance: FC<Props> = ({ onRoomIdSubmit }) => {
  const onCreateRoom = useCallback(() => {
    void (async () => {
      const res = await fetch(`${window.ENV.SERVER_URL}/rooms`, {
        method: "POST",
      });
      if (res.ok) {
        const roomId = (await res.text()) as RoomId;
        console.log(`Room ID: ${roomId}`);
        onRoomIdSubmit(roomId);
      }
    })();
  }, [onRoomIdSubmit]);

  return (
    <div>
      <h1>Workers Demo</h1>
      <button onClick={onCreateRoom}>Create room</button>
    </div>
  );
};

export default Entrance;
