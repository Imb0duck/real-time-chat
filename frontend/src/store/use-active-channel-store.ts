import { create, type StateCreator } from "zustand";
import type { Channel, Message } from "../types/chat";
import { SERVER_URL, socketService } from "../service/socket-service.ts";
import { Routes } from "../consts.ts";

interface IInitialState {
    activeChannel: Channel | null;
    isLoading: boolean;
}

interface IActions {
    loadChannel: (hannelId: string, userId: number) => Promise<void>;
    sendMessage: (message: string, userId: number) => Promise<void>;
    kickUser: (targetId: number, requesterId: number) => Promise<void>;
    clearChannel: () => void;
}

interface IChannel extends IInitialState, IActions {}

const initialState: IInitialState = {
    activeChannel: null,
    isLoading: false
}

const activeChannelStore: StateCreator<IChannel> = ((set, get) => ({
    ...initialState,
    loadChannel: async (channelId: string, userId: number) => {
        set({ isLoading: true });

        try{
            const res = await fetch(`${SERVER_URL}${Routes.Channels}/${channelId}`);
            if (!res.ok) throw new Error('Unable to enter channel');
            const data = await res.json();
            set({ activeChannel: data });

            socketService.joinChannel(channelId, userId);

            //Subscribe on server events for this channel(room)
            socketService.onMessage((msg: Message) => {
                set((state) => ({
                    activeChannel: state.activeChannel
                    ? {...state.activeChannel, messages: [...state.activeChannel.messages, msg]}
                    : null,
                }));
            });
            socketService.onParticipants((participants: number[]) => {
                set((state) => ({
                    activeChannel: state.activeChannel
                    ? { ...state.activeChannel, participants }
                    : null,
                }));
            });
            socketService.onDeleted((deletedId: string) => {
                if (get().activeChannel?.id === deletedId) {
                set({ activeChannel: null });
                }
            });
            socketService.onKicked((channelId: string) => {
                if (get().activeChannel?.id === channelId) {
                set({ activeChannel: null });
                }
            });
        }catch(error){
            console.log(error);
            throw new Error('Unable to enter channel');
        }finally{
            set({ isLoading: false });
        }
    },
    sendMessage: async (message: string, userId: number) => {
        const current = get().activeChannel;
        if (!current) return;
        const msg: Message = { id: crypto.randomUUID(), channelId: current.id, senderId: userId, text: message, timestamp: Date.now()};

        try{
            socketService.sendMessage(current.id, msg);
            set({ activeChannel: { ...current, messages: [...current.messages, msg]} });
        }catch(error){
            console.log(error);
            throw new Error('Unable to send message');
        }
    },
    kickUser: async (targetId: number, requesterId: number) => {
        const { activeChannel } = get();
        if (!activeChannel) return;

        try{
            socketService.kickUser(activeChannel.id, targetId, requesterId);
        }catch(error){
            console.log(error);
            throw new Error('Unable to kick this user');
        }
    },
    deleteChannel: (userId: number) => {
        const { activeChannel } = get();
        if (!activeChannel) return;

        try{
            socketService.deleteChannel(activeChannel.id, userId);
        }catch(error){
            console.log(error);
            throw new Error('Unable to kick this user');
        }
    },
    clearChannel: () => {
        set({ activeChannel: null });
        socketService.offChannel();
    }
}));

const useActiveChannelStore = create<IChannel>()(activeChannelStore);

export const useActiveChannel = () => useActiveChannelStore((state) => state.activeChannel);
export const useIsLoading = () => useActiveChannelStore((state) => state.isLoading);
export const loadChannel = (channelId: string, userId: number) => useActiveChannelStore.getState().loadChannel(channelId, userId);
export const sendMessage = (message: string, userId: number) => useActiveChannelStore.getState().sendMessage(message, userId);
export const kickUser = (targetId: number, requesterId: number) => useActiveChannelStore.getState().kickUser(targetId, requesterId);
export const clearChannel = () => useActiveChannelStore.getState().clearChannel();
