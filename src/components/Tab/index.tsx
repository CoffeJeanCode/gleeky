import { Tab as TabType } from "@/models/tab"
import { useCodeStore } from "@/store/code"
import { useTabStore } from "@/store/tab"
import { styled } from "goober"
import { useEffect, useRef, useState } from "react"


interface TabProps {
  tab: TabType
}

const Tab: React.FC<TabProps> = ({ tab }) => {
  const { activeTabId, tabs, removeTab, setActiveTab, updateTabName } = useTabStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(tab.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setCode } = useCodeStore()

  const isActive = activeTabId === tab.id

  const handleRemoveTab = (evt: React.FormEvent) => {
    evt.stopPropagation()
    if (tabs.length <= 1) return

    const wouldRemove = confirm(`Would you remove ${tab.name} file?`)
    if (!wouldRemove) return

    const nextTab = tabs.find(t => t.id !== tab.id)

    if (nextTab) {
      setCode(nextTab.content)
      setActiveTab(nextTab.id)
    }

    removeTab(tab.id)
  }

  const handleActiveTab = () => {
    setActiveTab(tab.id)

    setCode(tab.content)
  }

  const handleDoubleClick = (evt: React.MouseEvent) => {
    evt.stopPropagation()
    setIsEditing(true)
  }

  const handleNameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(evt.target.value)
  }

  const finishEditing = () => {
    if (editedName.trim()) {
      updateTabName(tab.id, editedName)
    } else {
      setEditedName(tab.name)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      finishEditing()
    } else if (evt.key === 'Escape') {
      setEditedName(tab.name)
      setIsEditing(false)
    }
  }

  useEffect(() => {
    if (isActive && tab.content) {
      setCode(tab.content)
    }
  }, [])

  return (
    <TabWrapper
      isActive={isActive}
      onClick={handleActiveTab}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <TabInput
          ref={inputRef}
          value={editedName}
          onChange={handleNameChange}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <TabTitle
          isActive={isActive}
        >
          {tab.name}
        </TabTitle>
      )}
      {
        tabs.length > 1 &&
        <CloseButton onClick={handleRemoveTab}>
          X
        </CloseButton>
      }
    </TabWrapper>
  );
}


const TabWrapper = styled("div") <{ isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--bg);
  border-right: 1px solid #252525;
  min-width: 150px;
  max-width: 220px;
  height: 35px;
  cursor: pointer;
  user-select: none;
  position: relative;
  gap: 0.5rem;

  &:hover {
    background: var(--hover);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ isActive }) => isActive ? 'var(--accent)' : 'transparent'};
  }
`

const TabInput = styled("input")`
  background: #3c3c3c;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.8125rem;
  padding: 0.2rem 0.4rem;
  width: 100%;
  flex: 1;

  &:focus {
    border: 1px solid var(--accent);
  }
`

const TabTitle = styled("span") <{ isActive: boolean }>`
  color: ${({ isActive }) => isActive ? '#fff' : 'var(--text)'};
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
`

const CloseButton = styled("button")`
  background: transparent;
  border: none;
  color: var(--text);
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