import { useCodeStore } from "@/store/code"
import { useTabStore } from "@/store/tab"
import { styled } from "goober"
import { useEffect } from "react"
import Tab from "../Tab"

const Tabs: React.FC = () => {
  const { code, setCode } = useCodeStore()
  const { tabs, addTab } = useTabStore()

  const handleAddTab = () => {
    addTab();
    setCode("")
  }

  useEffect(() => {
    const saveDocument = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const blob = new Blob([code], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.js";
        a.click();
        URL.revokeObjectURL(url);
      }
    }

    document.addEventListener('keydown', saveDocument);

    return () => {
      document.removeEventListener('keydown', saveDocument);
    }
  }, [])

  return <TabsWrapper>
    {tabs.map((tab) => (
      <Tab key={tab.id} tab={tab} />
    )
    )}
    <AddButton onClick={handleAddTab}>+</AddButton>
  </TabsWrapper>
}


const TabsWrapper = styled("section")`
  background: #282c34;
  display: flex;
  align-items: center;
`
const AddButton = styled("button")`
  background: transparent;
  border: none;
  color: #808080;
  padding: 0 .6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 2rem;
  transition: opacity 0.1s;

  &:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }
`


export default Tabs