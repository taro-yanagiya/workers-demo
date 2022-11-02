type Branded<K> = K & { readonly _brand: unique symbol };

export type SessionId = Branded<number>;
export type RoomId = Branded<string>;
export type ObjectId = Branded<number>;

export type JoinMessage = {
  type: "join";
  name: string;
};

export type VoteMessage = {
  type: "vote";
  value: number;
};

export type RestartMessage = {
  type: "restart";
};

export type RequestMessage = JoinMessage | VoteMessage | RestartMessage;

export type ReadyMessage = {
  type: "ready";
  id: SessionId;
};

export type MemberMessage = {
  type: "member";
  id: SessionId;
  name: string;
  vote: number | null;
};

export type JoinedMessage = {
  type: "joined";
  id: SessionId;
  name: string;
};

export type VotedMessage = {
  type: "voted";
  id: SessionId;
  value: number;
};

export type FixedMessage = {
  type: "fixed";
  average: number;
};

export type RestartedMessage = {
  type: "restarted";
};

export type QuitMessage = {
  type: "quit";
  id: SessionId;
};

export type ErrorMessage = {
  type: "error";
  detail?: string;
};

export type ResponseMessage =
  | MemberMessage
  | JoinedMessage
  | ReadyMessage
  | VotedMessage
  | FixedMessage
  | RestartedMessage
  | QuitMessage
  | ErrorMessage;

export type Result<T, E> = Success<T> | Failure<E>;
export type Success<T> = {
  result: "success";
  value: T;
};
export type Failure<E> = {
  result: "failure";
  type: E;
};

export const success = <T>(value: T): Success<T> => ({
  result: "success",
  value,
});
export const failure = <E>(type: E): Failure<E> => ({
  result: "failure",
  type,
});

export type VoteRequest = {
  vote: number;
  sessionId: SessionId;
};

export type VoteResponseError = {
  cause: "not_ready" | "session_not_found" | "game_fixed";
};
