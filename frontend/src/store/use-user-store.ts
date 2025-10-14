import { create, type StateCreator } from "zustand";
import { socketService } from "../service/socket-service";
import type { User } from "../types/chat";
import { Routes } from "../consts";

interface IInitialState {
    user: User | null;
    isLoading: boolean;
}

interface IActions {
    signIn: (id: number) => Promise<void>;
    signOut: () => void;
}

interface IUser extends IInitialState, IActions {}

const initialState: IInitialState = {
    user: null,
    isLoading: false
}

const userStore: StateCreator<IUser> = ((set) => ({
    ...initialState,
    signIn: async (id: number) => {
        set({ isLoading: true });

        try{
            const res = await fetch(`${Routes.Users}/${id}`);
            if (!res.ok) throw new Error('Unable to sign in');
            const user: User = await res.json();

            set({ user });
            socketService.connect(user.id);
        }catch(error){
            console.log(error);
            throw new Error('Unable to sign in');
        }finally{
            set({ isLoading: false });
        }
    },
    signOut: () => {
        set({ user: null });
        socketService.disconnect();
    }
}));

const useUserStore = create<IUser>()(userStore);

export const useUser = () => useUserStore((state) => state.user);
export const useIsLoading = () => useUserStore((state) => state.isLoading);
export const signIn = (id: number) => useUserStore.getState().signIn(id);
export const signOut = () => useUserStore.getState().signOut();
