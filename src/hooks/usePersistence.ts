import { Item, OperatorGoal } from "../types";
import useLocalStorage from "./useLocalStorage";

function usePersistence() {
  const [operatorGoals, setOperatorGoals] = useLocalStorage<OperatorGoal[]>(
    "operatorGoals",
    []
  );
  const [materialsOwned, setMaterialsOwned] = useLocalStorage(
    "materialsOwned",
    {} as Record<string, number | null>
  );
  const [itemsToCraft, setItemsToCraft] = useLocalStorage(
    "itemsToCraft",
    {} as Record<string, Item>
  );

  return {
    operatorGoals,
    setOperatorGoals,
    materialsOwned,
    setMaterialsOwned,
    itemsToCraft,
    setItemsToCraft,
  } as const;
}

export default usePersistence;
