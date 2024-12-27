import type { Code, Output } from '@/models/code';
import { create } from 'zustand';

interface CodeStore {
  code: Code;
  output: Output;

  setCode: (code: string) => void;
  setOutput: (output: Output) => void;
};

export const useCodeStore = create<CodeStore>()((set) => ({
  code: '',
  output: [],
  setCode: (code: string) => set({ code }),
  setOutput: (output: Output) => set({ output }),
}));
