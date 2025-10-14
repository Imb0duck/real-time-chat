import { create, type StateCreator } from "zustand";
import type { ChannelShortInfo, User } from "../types/chat";
import { Routes } from "../consts";

interface IInitialState {
    query: string;
    userResults: User[];
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
                fetch(`${Routes.Users}?q=${query}`).then(res => res.json()),
                fetch(Routes.Channels).then(res => res.json())
            ]);
            const filteredChannels = channels.filter((c: ChannelShortInfo) => c.name.toLowerCase().includes(query.toLowerCase()));
            const filteredUsers = users.filter((u: User) => u.username.toLowerCase().includes(query.toLowerCase()));
            set({ userResults: filteredUsers, channelResults: filteredChannels });
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

export const useFUserResults = () => useSearchStore((state) => state.userResults);
export const useChannelResults = () => useSearchStore((state) => state.channelResults);
export const search = (query: string) => useSearchStore.getState().search(query);
export const clear = () => useSearchStore.getState().clear();
