import { create } from 'zustand';

type Store = {
    code: string;
    output: string;
    isLoading: boolean;
    setCode: (code: string) => void;
    setOuput: (output: string) => void;
    setIsLoading: (isLOading: boolean) => void;
};

export const useStore = create<Store>((set) => ({
    code: '',
    output: '',
    isLoading: false,
    setCode: (code: string) => set({ code }),
    setOuput: (output: string) => set({ output }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));
