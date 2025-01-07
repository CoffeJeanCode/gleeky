import { create } from "zustand"
import { Tab } from "@/models/tab"
import { persist } from "zustand/middleware"

export interface TabStore {
  tabs: Tab[]
  activeTabId: string

  setActiveTab: (id: string) => void
  addTab: () => void
  removeTab: (id: string) => void
  updateTabContent: (id: string, content: string) => void
  updateTabName: (id: string, name: string) => void
  resetTabs: () => void
}

const initialState = {
  tabs: [{ id: "1", name: 'untitled-1', content: '' }],
  activeTabId: "1"
}

export const useTabStore = create<TabStore>()(persist((set) => ({
  ...initialState,
  setActiveTab: (id: string) => set({ activeTabId: id }),
  addTab: () =>
    set((state) => {
      const newId = (Math.max(...state.tabs.map(tab => parseInt(tab.id))) + 1).toString()
      return {
        tabs: [...state.tabs, {
          id: newId,
          name: `untitled-${newId}`,
          content: ''
        }],
        activeTabId: newId
      }
    }),
  removeTab: (id: string) =>
    set((state) => {
      const newTabs = state.tabs.filter(tab => tab.id !== id)
      const newActiveId = state.activeTabId === id
        ? newTabs[0].id || null
        : state.activeTabId
      return {
        tabs: newTabs,
        activeTabId: newActiveId ?? "0"
      }
    }),
  updateTabContent: (id: string, content: string) =>
    set((state) => ({
      tabs: state.tabs.map(tab =>
        tab.id === id ? { ...tab, content } : tab
      )
    })),
  updateTabName: (id: string, name: string) =>
    set((state) => ({
      tabs: state.tabs.map(tab =>
        tab.id === id ? { ...tab, name } : tab
      )
    })),
  resetTabs: () =>
    set(() => initialState)
}), {
  name: "tabs"
}))