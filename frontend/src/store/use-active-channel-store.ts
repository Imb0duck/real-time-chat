import { create, type StateCreator } from "zustand";
import type { Channel } from "../types/chat";

interface IInitialState {
    activeChannel: Channel | null;
    isLoading: boolean;
}

interface IActions {
    loadChannel: (id: number) => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
    kickUser: (id: number) => Promise<void>;
}

interface IChannel extends IInitialState, IActions {}

const initialState: IInitialState = {
    activeChannel: null,
    isLoading: false
}

const activeChannelStore: StateCreator<IChannel> = ((set) => ({
    ...initialState,
    loadChannel: async (id: number) => {
        set({ isLoading: true });

        try{

        }catch(error){
            console.log(error);
            throw new Error('Unable to enter channel');
        }finally{
            set({ isLoading: false });
        }
    },
    sendMessage: async (message: string) => {
        try{

        }catch(error){
            console.log(error);
            throw new Error('Unable to send message');
        }
    },
    kickUser: async (id: number) => {
        try{

        }catch(error){
            console.log(error);
            throw new Error('Unable to kick this user');
        }
    }
}));

const useActiveChannelStore = create<IChannel>()(activeChannelStore);

export const useActiveChannel = () => useActiveChannelStore((state) => state.activeChannel);
export const useIsLoading = () => useActiveChannelStore((state) => state.isLoading);
export const loadChannel = (id: number) => useActiveChannelStore.getState().loadChannel(id);
export const sendMessage = (message: string) => useActiveChannelStore.getState().sendMessage(message);
export const kickUser = (id: number) => useActiveChannelStore.getState().kickUser(id);
