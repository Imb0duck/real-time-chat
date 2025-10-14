import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/event.ts";
import type { ChannelShortInfo, Message } from "../types/chat";
import { Events } from "../consts.ts";

const SERVER_URL = "http://localhost:3001";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io( SERVER_URL, { autoConnect: false });

export const socketService = {
  connect: (userId: number) => {
    if (!socket.connected) {
      socket.connect();
      socket.emit(Events.Identify, userId);
    }
  },

  disconnect: () => {
    if (socket.connected) socket.disconnect();
  },

  //Emitters
  joinChannel: (channelId: string, userId: number) =>
    socket.emit(Events.Join, { channelId, userId }),

  leaveChannel: (channelId: string, userId: number) =>
    socket.emit(Events.Leave, { channelId, userId }),

  sendMessage: (channelId: string, message: Message) =>
    socket.emit(Events.Message, { channelId, message }),

  kickUser: (channelId: string, targetId: number, requesterId: number) =>
    socket.emit(Events.Kick, { channelId, targetId, requesterId }),

  deleteChannel: (channelId: string, userId: number) =>
    socket.emit(Events.Delete, { channelId, userId }),

  createChannel: (name: string, creatorId: number) =>
    socket.emit(Events.Create, {name, creatorId}),

  //Listeners
  onMessage: (cb: (message: Message) => void) => {
    socket.on(Events.Message, cb);
  },

  onParticipants: (cb: (participants: number[]) => void) => {
    socket.on(Events.Participants, cb);
  },

  onDeleted: (cb: (channelId: string) => void) => {
    socket.on(Events.Deleted, cb);
  },

  onKicked: (cb: (channelId: string) => void) => {
    socket.on(Events.Kicked, cb);
  },

  onChannelsUpdated: (cb: (channels: ChannelShortInfo[]) => void) => {
    socket.on(Events.Update, cb);
  },

  offChannel: () => {
    socket.off(Events.Message);
    socket.off(Events.Participants);
    socket.off(Events.Deleted);
    socket.off(Events.Kicked);
  },

  offChannelsUpdated: () => {
    socket.off(Events.Update);
  }
};
