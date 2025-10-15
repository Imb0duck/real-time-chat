import { create, type StateCreator } from "zustand";
import type { ChannelShortInfo, UserShortInfo } from "../types/chat";
import { Routes } from "../consts";
import { SERVER_URL } from "../service/socket-service";

interface IInitialState {
    query: string;
    userResults: UserShortInfo[];
    channelResults: ChannelShortInfo[];
    isLoading: boolean;
}

interface IActions {
    search: (query: string) => Promise<void>;
    clear: () => void;
}

interface ISearch extends IInitialState, IActions {}

const initialState: IInitialState = {
    query: '',
    userResults: [],
    channelResults: [],
    isLoading: false
}

const searchStore: StateCreator<ISearch> = ((set) => ({
    ...initialState,
    search: async (query: string) => {
        set({ query, isLoading: true });
        try {
            const [users, channels] = await Promise.all([
                fetch(`${SERVER_URL}${Routes.Users}?q=${query}`).then(res => res.json()),
                fetch(`${SERVER_URL}${Routes.Channels}`).then(res => res.json())
            ]);
            const filteredChannels = channels.filter((c: ChannelShortInfo) => c.name.toLowerCase().includes(query.toLowerCase()));
            set({ userResults: users, channelResults: filteredChannels });
        }catch(error){
            console.log(error);
            throw new Error('Unable to coincidences');
        } finally {
            set({ isLoading: false });
        }
    },
  clear: () => set({ query: '', userResults: [], channelResults: [] })
}));

const useSearchStore = create<ISearch>()(searchStore);

export const useUserResults = () => useSearchStore((state) => state.userResults);
export const useChannelResults = () => useSearchStore((state) => state.channelResults);
export const useIsSearchLoading = () => useSearchStore((state) => state.isLoading)
export const search = (query: string) => useSearchStore.getState().search(query);
export const clear = () => useSearchStore.getState().clear();
