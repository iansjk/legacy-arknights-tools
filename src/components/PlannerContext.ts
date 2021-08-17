import { createContext } from "react";
import { Operator, Item } from "../types";

const PlannerContext = createContext<{
  operatorMap: Record<string, Operator>;
  itemMap: Record<string, Item>;
}>({
  operatorMap: {},
  itemMap: {},
});
export default PlannerContext;
