import { create, type StateCreator } from "zustand";
import type { UserShortInfo } from "../types/chat";
import { Routes } from "../consts";
import { SERVER_URL } from "../service/socket-service";

interface IInitialState {
    users: UserShortInfo[];
    isLoading: boolean;
}

interface IActions {
    setUsers: () => Promise<void>;
    clearUsers: () => void;
}

interface ILogin extends IInitialState, IActions {}

const initialState: IInitialState = {
    users: [],
    isLoading: false
}

const loginStore: StateCreator<ILogin> = ((set) => ({
    ...initialState,
    setUsers: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch(`${SERVER_URL}${Routes.Users}`);
            const data = await res.json();
            set({ users: data });
        }catch(error){
            console.log(error);
            throw new Error('Unable to load users');
        } finally {
            set({ isLoading: false });
        }
    },
    clearUsers: () => set({ users: [] })
}));

const useLoginStore = create<ILogin>()(loginStore);

export const useUserList = () => useLoginStore((state) => state.users);
export const useIsLoginLoading = () => useLoginStore((state) => state.isLoading);
export const setUsers = () => useLoginStore.getState().setUsers();
export const clearUsers = () => useLoginStore.getState().clearUsers();
