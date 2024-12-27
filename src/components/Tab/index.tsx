import { Tab as TabType } from "@/models/tab"
import { useCodeStore } from "@/store/code"
import { useTabStore } from "@/store/tab"
import { styled } from "goober"
import { useEffect } from "react"


interface TabProps {
  tab: TabType
}

const Tab: React.FC<TabProps> = ({ tab }) => {
  const { activeTabId, tabs, removeTab, setActiveTab } = useTabStore()
  const { setCode } = useCodeStore()

  const isActive = activeTabId === tab.id

  const handleRemoveTab = (evt: React.FormEvent) => {
    evt.stopPropagation()
    if (tabs.length <= 1) return
    const wouldRemove = confirm(`Would you remove ${tab.name} file?`)
    if (!wouldRemove) return
    const currentTab = tabs.find(() => isActive)
    setCode(currentTab?.content ?? "")
    removeTab(tab.id)
  }

  const handleActiveTab = () => {
    setActiveTab(tab.id)

    setCode(tab.content)
  }

  useEffect(() => {
    if (isActive && tab.content) {
      setCode(tab.content)
    }
  }, [])

  return (
    <TabWrapper isActive={isActive} onClick={handleActiveTab}>
      <TabTitle isActive={isActive}>{tab.name}</TabTitle>
      <CloseButton onClick={handleRemoveTab}>
        X
      </CloseButton>
    </TabWrapper>
  );
}


const TabWrapper = styled("div") <{ isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #282c34;
  border-right: 1px solid #252525;
  min-width: 120px;
  max-width: 200px;
  height: 35px;
  cursor: pointer;
  user-select: none;
  position: relative;
  gap: 0.5rem;

  &:hover {
    background:rgb(23, 27, 36);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ isActive }) => isActive ? '#007acc' : 'transparent'};
  }
`

const TabTitle = styled("span") <{ isActive: boolean }>`
  color: ${({ isActive }) => isActive ? '#fff' : '#909090'};
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
`

const CloseButton = styled("button")`
  background: transparent;
  border: none;
  color: #808080;
  padding: 2px 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.1s;
  border-radius: 3px;

  &:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }
`
export default Tab