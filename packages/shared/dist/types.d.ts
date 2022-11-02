declare type Branded<K> = K & {
    readonly _brand: unique symbol;
};
export declare type SessionId = Branded<number>;
export declare type RoomId = Branded<string>;
export declare type ObjectId = Branded<number>;
export declare type JoinMessage = {
    type: "join";
    name: string;
};
export declare type VoteMessage = {
    type: "vote";
    value: number;
};
export declare type RestartMessage = {
    type: "restart";
};
export declare type RequestMessage = JoinMessage | VoteMessage | RestartMessage;
export declare type ReadyMessage = {
    type: "ready";
    id: SessionId;
};
export declare type MemberMessage = {
    type: "member";
    id: SessionId;
    name: string;
    vote: number | null;
};
export declare type JoinedMessage = {
    type: "joined";
    id: SessionId;
    name: string;
};
export declare type VotedMessage = {
    type: "voted";
    id: SessionId;
    value: number;
};
export declare type FixedMessage = {
    type: "fixed";
    average: number;
};
export declare type RestartedMessage = {
    type: "restarted";
};
export declare type QuitMessage = {
    type: "quit";
    id: SessionId;
};
export declare type ErrorMessage = {
    type: "error";
    detail?: string;
};
export declare type ResponseMessage = MemberMessage | JoinedMessage | ReadyMessage | VotedMessage | FixedMessage | RestartedMessage | QuitMessage | ErrorMessage;
export declare type Result<T, E> = Success<T> | Failure<E>;
export declare type Success<T> = {
    result: "success";
    value: T;
};
export declare type Failure<E> = {
    result: "failure";
    type: E;
};
export declare const success: <T>(value: T) => Success<T>;
export declare const failure: <E>(type: E) => Failure<E>;
export declare type VoteRequest = {
    vote: number;
    sessionId: SessionId;
};
export declare type VoteResponseError = {
    cause: "not_ready" | "session_not_found" | "game_fixed";
};
export {};
//# sourceMappingURL=types.d.ts.map