import { useParams } from "@remix-run/react";
import type { RoomId } from "@shared/types";
import type { FC } from "react";
import { useCallback, useState } from "react";
import type { Status } from "~/app";
import Canvas from "~/Canvas";

const Room: FC = () => {
  const { roomId } = useParams();
  const [workersStatus, setWorkersStatus] = useState<Status>("disconnected");
  const [nodejsStatus, setNodejsStatus] = useState<Status>("disconnected");

  const [workersCount, setWorkersCount] = useState<number>(0);
  const [nodejsCount, setNodejsCount] = useState<number>(0);

  const onWorkersStatusChanged = useCallback(
    (status) => setWorkersStatus(status),
    [],
  );
  const onWorkersMemberChanged = useCallback(
    (count) => setWorkersCount(count),
    [],
  );

  const onNodejsStatusChanged = useCallback(
    (status) => setNodejsStatus(status),
    [],
  );
  const onNodejsMemberChanged = useCallback(
    (count) => setNodejsCount(count),
    [],
  );

  if (roomId === undefined) {
    return <p>Error: Please specify room ID.</p>;
  }

  return (
    <div>
      <h3>Cloudflare Workers</h3>
      <p>
        接続: {workersStatus} 参加者数: {workersCount}
      </p>
      <Canvas
        width={800}
        height={500}
        roomId={roomId as RoomId}
        useNode={false}
        onStatusChanged={onWorkersStatusChanged}
        onMemberChanged={onWorkersMemberChanged}
      />
      <h3>Heroku (US server)</h3>
      <p>
        接続: {nodejsStatus} 参加者数: {nodejsCount}
      </p>
      <Canvas
        width={800}
        height={500}
        roomId={roomId as RoomId}
        useNode={true}
        onStatusChanged={onNodejsStatusChanged}
        onMemberChanged={onNodejsMemberChanged}
      />
    </div>
  );
};

export default Room;
