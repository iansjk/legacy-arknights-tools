import { useEffect, useState } from "react";
import localforage from "localforage";

import { SchemaV1 } from "./current-schema";
import useLocalStorage from "./useLocalStorage";

const useUserData = (): SchemaV1 => {
  const [userData, setUserData] = useState<SchemaV1>({
    operatorGoals: [],
    materialsOwned: {},
    itemsToCraft: {},
    version: 1,
  });
  const [operatorGoalsV0] = useLocalStorage("operatorGoals", []);
  const [materialsOwnedV0] = useLocalStorage("materialsOwned", {});
  const [itemsToCraftV0] = useLocalStorage("itemsToCraft", {});

  useEffect(() => {
    localforage
      .getItem<SchemaV1 | undefined>("userData")
      .then((existingData) => {
        if (existingData) {
          setUserData(existingData);
        } else {
          // attempt to migrate old data
          // TODO
        }
      });
  }, []);

  return userData;
};
export default useUserData;
