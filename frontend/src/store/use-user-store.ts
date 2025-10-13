import { create, type StateCreator } from "zustand";
import type { User } from "../types/chat";

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

        }catch(error){
            console.log(error);
            throw new Error('Unable to sign in');
        }finally{
            set({ isLoading: false });
        }
    },
    signOut: () => {
        set({user: null});
    }
}));

const useUserStore = create<IUser>()(userStore);

export const useUser = () => useUserStore((state) => state.user);
export const useIsLoading = () => useUserStore((state) => state.isLoading);
export const signIn = (id: number) => useUserStore.getState().signIn(id);
export const signOut = () => useUserStore.getState().signOut();
