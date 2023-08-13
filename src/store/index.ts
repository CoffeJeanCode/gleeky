import { create } from 'zustand';

type Store = {
  code: string;
  output: string[];
  error: Error | null;
  isLoading: boolean;
  setCode: (code: string) => void;
  setError: (error: Error | null) => void;
  setOutput: (output: string[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateOutputLine: (lineNumber: number, newOutput: string) => void;
};

export const useStore = create<Store>((set, get) => ({
  code: '',
  output: [],
  error: null,
  isLoading: false,
  setCode: (code: string) => set({ code }),
  setOutput: (output: string[]) => set({ output }),
  setError: (error: Error | null) => set({ error }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  updateOutputLine: (lineNumber: number, newOutput: string) => {
    set(() => {
      const updatedOutput = [...get().output];
      updatedOutput[lineNumber] = newOutput;
      return { output: updatedOutput };
    });
  },
}));
