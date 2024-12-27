export interface Tab {
  id: string
  name: string
  content: string
}

export interface Tabs {
  tabs: Tab[],
  activeTabId: string
}