import { FC, useEffect } from "react";
import { useStore } from "../../store";


const CodeRunner: FC = () => {
  const { code, output, isLoading, setIsLoading, setOuput } = useStore();

  const executeCode = async () => {
    setIsLoading(true);
    try {
      const result = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(eval(code));
        }, 500);
      });

      console.log(result)
      setOuput(result.toString());
    } catch (error: any) {
      setOuput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    executeCode()
  }, [code])

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      <div>Output: {output}</div>
    </div>
  );
};

export default CodeRunner;
