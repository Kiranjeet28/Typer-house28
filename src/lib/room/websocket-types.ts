export type UserStatus = "ACTIVE" | "LEFT";

export type LivePlayer = {
    id: string;
    name: string;
    wpm: number;
    status: UserStatus;
};

export type ClientMessage =
    | { type: "JOIN_ROOM"; roomId: string }
    | { type: "WPM_UPDATE"; wpm: number }
    | { type: "LEAVE_ROOM" };

export type ServerMessage =
    | { type: "ROOM_STATE"; players: LivePlayer[] }
    | { type: "PLAYER_SPEED"; userId: string; wpm: number }
    | { type: "PLAYER_JOINED"; player: LivePlayer }
    | { type: "PLAYER_LEFT"; userId: string }
    | { type: "ERROR"; message: string }
    | { type: "CONNECTION_ERROR"; message: string };