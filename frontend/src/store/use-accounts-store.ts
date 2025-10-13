import { create, type StateCreator } from "zustand";
import type { User } from "../types/chat";

interface IUsers {
    users: User[];
}

const initialState: IUsers = {
    users: [],
}

const userStore: StateCreator<IUsers> = (() => ({
    ...initialState
}));

const useUserStore = create<IUsers>()(userStore);

export const useUsers = () => useUserStore((state) => state.users);
