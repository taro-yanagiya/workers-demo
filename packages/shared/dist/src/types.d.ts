declare type Branded<K> = K & {
    readonly _brand: unique symbol;
};
export declare type SessionId = Branded<string>;
export declare type JoinMessage = {
    type: "join";
    name: string;
};
export declare type VoteMessage = {
    type: "vote";
    value: number;
};
export declare type IncomingMessage = JoinMessage | VoteMessage;
export declare type ReadyMessage = {
    type: "ready";
};
export declare type JoinedMessage = {
    type: "joined";
    name: string;
};
export declare type VotedMessage = {
    type: "voted";
    name: string;
    value: number;
};
export declare type QuitMessage = {
    type: "quit";
    name: string;
};
export declare type ErrorMessage = {
    type: "error";
    detail?: string;
};
export declare type OutgoingMessage = JoinedMessage | ReadyMessage | VotedMessage | QuitMessage | ErrorMessage;
export {};
//# sourceMappingURL=types.d.ts.map