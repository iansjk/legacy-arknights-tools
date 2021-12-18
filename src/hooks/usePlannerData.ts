import { useEffect, useState } from "react";
import localforage from "localforage";

import { SchemaV0, SchemaV1 } from "./current-schema";
import useLocalStorage from "./useLocalStorage";

const usePlannerData = (): SchemaV1 => {
  const [plannerData, setPlannerData] = useState<SchemaV1>({
    operatorGoals: [],
    materialsOwned: {},
    itemsToCraft: {},
    version: 1,
  });
  const [operatorGoalsV0] = useLocalStorage<SchemaV0.OperatorGoals>(
    "operatorGoals",
    []
  );
  const [materialsOwnedV0] = useLocalStorage<SchemaV0.MaterialsOwned>(
    "materialsOwned",
    {}
  );
  const [itemsToCraftV0] = useLocalStorage<SchemaV0.ItemsToCraft>(
    "itemsToCraft",
    {}
  );

  useEffect(() => {
    localforage
      .getItem<SchemaV1 | undefined>("plannerData")
      .then((existingData) => {
        if (existingData) {
          setPlannerData(existingData);
        } else {
          // attempt to migrate old data
          // TODO
        }
      });
  }, []);

  return plannerData;
};
export default usePlannerData;
