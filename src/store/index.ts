import { create } from 'zustand';
import { persist } from "zustand/middleware"
import { CodeType, OutputType } from '../types/code';

interface Store {
  code: CodeType;
  output: OutputType[];
  error: Error | null;
  isLoading: boolean;
  setCode: (code: string) => void;
  setError: (error: Error | null) => void;
  setOutput: (output: OutputType[]) => void;
  setIsLoading: (isLoading: boolean) => void;
};

export const useStore = create<Store>()(
  persist((set) => ({
    code: '',
    output: [],
    error: null,
    isLoading: false,
    setCode: (code: string) => set({ code }),
    setOutput: (output: OutputType[]) => set({ output }),
    setError: (error: Error | null) => set({ error }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
  }), {
    name: 'code-runner',
  }));
