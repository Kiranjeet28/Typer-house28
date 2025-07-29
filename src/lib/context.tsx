"use client";

import { $Enums } from '@prisma/client';
import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Define the Room type (based on your Prisma model)
export type Room = {
    id: string;
    name: string;
    description?: string;
    creatorId: string;
    joinCode: string;
    maxPlayers: number;
    isPrivate: boolean;
    status: $Enums.RoomStatus; // You can use an enum if you have one
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    codeValid: boolean;
    gameMode: $Enums.GameMode; // Use enum if available
    textLength: $Enums.TextLength; // Use enum if available
    timeLimit?: number;
    customText?: string;
};

// Define actions for the reducer (example)
type RoomAction =
    | { type: 'SET_ROOM'; payload: Room }
    | { type: 'CLEAR_ROOM' };

// Define the context state
type RoomState = {
    room: Room | null;
};

// Initial state
const initialState: RoomState = {
    room: null,
};

// Reducer function
function roomReducer(state: RoomState, action: RoomAction): RoomState {
    switch (action.type) {
        case 'SET_ROOM':
            return { ...state, room: action.payload };
        case 'CLEAR_ROOM':
            return { ...state, room: null };
        default:
            return state;
    }
}

// Create context
const RoomContext = createContext<{
    state: RoomState;
    dispatch: Dispatch<RoomAction>;
}>({
    state: initialState,
    dispatch: () => undefined,
});

// Provider component
export const RoomProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(roomReducer, initialState);

    return (
        <RoomContext.Provider value={{ state, dispatch }}>
            {children}
        </RoomContext.Provider>
    );
};

// Custom hook to use the context
export const useRoomContext = () => useContext(RoomContext);