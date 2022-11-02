import { useNavigate } from "@remix-run/react";
import type { RoomId } from "@shared/types";
import type { FC } from "react";
import { useCallback } from "react";
import Entrance from "~/Entrance";

const Index: FC = () => {
  const navigate = useNavigate();
  const setRoomId = useCallback(
    (roomId: RoomId) => {
      navigate(`/rooms/${roomId}`);
    },
    [navigate],
  );

  return <Entrance onRoomIdSubmit={(roomId) => setRoomId(roomId)} />;
};

export default Index;
