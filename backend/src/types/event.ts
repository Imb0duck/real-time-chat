import type { Message, User } from "./chat.ts";

export type ClientToServerEvents = {
  "create-channel": (payload: { name: string; creator: User }) => void;
  "join-channel": (payload: { channelId: string; user: User }) => void;
  "leave-channel": (payload: { channelId: string; userId: number }) => void;
  "message": (payload: { channelId: string; message: Message }) => void;
  "kick-user": (payload: {
    channelId: string;
    targetId: number;
    requesterId: number;
  }) => void;
  "identify": (userId: number) => void;
};

export type ServerToClientEvents = {
  "channels-updated": (
    channels: Array<{ id: string; name: string; creatorId: number }>
  ) => void;
  "participants-updated": (participants: number[]) => void;
  "channel-history": (messages: Message[]) => void;
  "message": (message: Message) => void;
  "kicked": (data: { channelId: string }) => void;
  "error": (message: string) => void;
};

export type InterServerEvents = {
  ping: () => void;
};

export type SocketData = {
  userId?: number;
};
