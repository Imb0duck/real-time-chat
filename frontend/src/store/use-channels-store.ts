import { create, type StateCreator } from "zustand";
import { SERVER_URL, socketService } from "../service/socket-service";
import type { ChannelShortInfo } from "../types/chat";
import { Routes } from "../consts";

interface IInitialState {
    channels: ChannelShortInfo[];
    isLoading: boolean;
}

interface IActions {
    loadChannels: (userId: number) => Promise<void>;
    updateChannels: (userId: number) => void;
    createChannel: (name: string, creatorId: number) => void;
    stopUpdate: () => void;
}

interface IChannels extends IInitialState, IActions {}

const initialState: IInitialState = {
    channels: [],
    isLoading: false
}

const channelsStore: StateCreator<IChannels> = ((set) => ({
    ...initialState,
    loadChannels: async (userId: number) => {
        set({ isLoading: true });

        try{
            const res = await fetch(`${SERVER_URL}${Routes.Channels}?userId=${userId}`);
            const data = await res.json();
            set({ channels: data });
        }catch(error){
            console.log(error);
            throw new Error('Unable to load channels');
        }finally{
            set({ isLoading: false });
        }
    },
    updateChannels: (userId: number) => {
        socketService.onChannelsUpdated((list: ChannelShortInfo[]) => {
            const userChannels = list.filter((ch) => ch.participants?.includes(userId));
            set({ channels: userChannels });
        });
    },
    stopUpdate: () => {
        socketService.offChannelsUpdated();
    },
    createChannel: (name: string, creatorId: number) => {
        socketService.createChannel(name, creatorId);
    }
}));

const useChannelsStore = create<IChannels>()(channelsStore);

export const useUserChannels = () => useChannelsStore((state) => state.channels);
export const useIsChannelsLoading = () => useChannelsStore((state) => state.isLoading);
export const loadChannels = (userId: number) => useChannelsStore.getState().loadChannels(userId);
export const updateChannels = (userId: number) => useChannelsStore.getState().updateChannels(userId);
export const stopUpdate = () => useChannelsStore.getState().stopUpdate();
export const createChannel = (name: string, creatorId: number) => useChannelsStore.getState().createChannel(name, creatorId);
