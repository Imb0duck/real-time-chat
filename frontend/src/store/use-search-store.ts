import { create, type StateCreator } from "zustand";
import type { ChannelShortInfo, User, UserShortInfo } from "../types/chat";
import { Routes } from "../consts";
import { SERVER_URL } from "../service/socket-service";

interface IInitialState {
    query: string;
    userResults: UserShortInfo[];
    channelResults: ChannelShortInfo[];
    selectedUser: User | null;
    isLoading: boolean;
}

interface IActions {
    search: (query: string) => Promise<void>;
    openModal: (userId: number) => Promise<void>;
    clear: () => void;
    closeModal: () => void;
}

interface ISearch extends IInitialState, IActions {}

const initialState: IInitialState = {
    query: '',
    userResults: [],
    channelResults: [],
    selectedUser: null,
    isLoading: false
}

//Control search results
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
    openModal: async (userId: number) => {
        try {
            const res = await fetch(`${SERVER_URL}${Routes.Users}/${userId}`);
            if (!res.ok) throw new Error('Unable to fetch user');
            const user: User = await res.json();
            set({ selectedUser: user });
        }catch(error){
            console.log(error);
            throw new Error('Unable to fetch user');
        } finally {
            set({ isLoading: false });
        }
    },
    closeModal: () => set({ selectedUser: null }),
    clear: () => set({ query: '', userResults: [], channelResults: [] })
}));

const useSearchStore = create<ISearch>()(searchStore);

export const useUserResults = () => useSearchStore((state) => state.userResults);
export const useChannelResults = () => useSearchStore((state) => state.channelResults);
export const useIsSearchLoading = () => useSearchStore((state) => state.isLoading);
export const useSelectedUser = () => useSearchStore((s) => s.selectedUser);
export const search = (query: string) => useSearchStore.getState().search(query);
export const clear = () => useSearchStore.getState().clear();
export const openModal = (userId: number) => useSearchStore.getState().openModal(userId);
export const closeModal = () => useSearchStore.getState().closeModal();
