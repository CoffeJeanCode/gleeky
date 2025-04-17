import { addAutoLog } from "../log/addLogInput";
import { injectLoopGuards } from "./loopGuard";
import { createUtilFunctions } from "./utilFunctions";

export const prepareUserCode = (code: string): string => {
  const normalized = addAutoLog(code);
  const instrumented = injectLoopGuards(normalized);
  return `
    ${createUtilFunctions()}
    ${instrumented}
  `;
}
