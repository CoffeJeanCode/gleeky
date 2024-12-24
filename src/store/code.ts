import type { Code, Output } from '@/models/code';
import { create } from 'zustand';
import { persist } from "zustand/middleware"

interface Store {
  code: Code;
  output: Output;
  setCode: (code: string) => void;
  setOutput: (output: Output) => void;
};

export const useCode = create<Store>()(
  persist((set) => ({
    code: '',
    output: [],
    setCode: (code: string) => set({ code }),
    setOutput: (output: Output) => set({ output }),
  }), {
    name: 'code-runner',
  }));
