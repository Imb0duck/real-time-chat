import { create, type StateCreator } from "zustand";
import type { ChannelShortInfo } from "../types/chat";

interface IInitialState {
    channels: ChannelShortInfo[];
    isLoading: boolean;
}

interface IActions {
    loadChannels: () => Promise<void>;
    joinChannel: (id: number) => Promise<void>;
    createChannel: () => Promise<void>;
}

interface IChannels extends IInitialState, IActions {}

const initialState: IInitialState = {
    channels: [],
    isLoading: false
}

const channelsStore: StateCreator<IChannels> = ((set) => ({
    ...initialState,
    loadChannels: async () => {
        set({ isLoading: true });

        try{

        }catch(error){
            console.log(error);
            throw new Error('Unable to load channels');
        }finally{
            set({ isLoading: false });
        }
    },
    joinChannel: async (id: number) => {
        try{

        }catch(error){
            console.log(error);
            throw new Error('Unable to join channel');
        }
    },
    createChannel: async () => {
        try{

        }catch(error){
            console.log(error);
            throw new Error('Unable to create channel');
        }
    }
}));

const useChannelsStore = create<IChannels>()(channelsStore);

export const useActiveChannel = () => useChannelsStore((state) => state.channels);
export const useIsLoading = () => useChannelsStore((state) => state.isLoading);
export const loadChannels = () => useChannelsStore.getState().loadChannels();
export const joinChannel = (id: number) => useChannelsStore.getState().joinChannel(id);
export const createChannel = () => useChannelsStore.getState().createChannel();
