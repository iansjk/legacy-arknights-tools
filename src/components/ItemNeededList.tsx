import React, { useContext } from "react";
import {
  craftItemOnce,
  decrementItemQuantity,
  incrementItemQuantity,
  setItemQuantity,
  toggleItemCrafting,
} from "../store/depotSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { operatorGoalIngredients } from "../utils";
import PlannerContext from "./PlannerContext";

const ItemNeededList: React.VFC = () => {
  const dispatch = useAppDispatch();
  const { itemsBeingCrafted, quantities } = useAppSelector(
    (state) => state.depot
  );
  const { operators: operatorGoals } = useAppSelector((state) => state.goals);
  const { itemMap, operatorMap } = useContext(PlannerContext);

  const handleIncrement = (itemId: string) => {
    dispatch(incrementItemQuantity(itemId));
  };

  const handleDecrement = (itemId: string) => {
    dispatch(decrementItemQuantity(itemId));
  };

  const handleChangeQuantity = (itemId: string, quantity: number) => {
    dispatch(setItemQuantity({ itemId, quantity }));
  };

  const handleToggleCrafting = (itemId: string) => {
    dispatch(toggleItemCrafting(itemId));
  };

  const handleCraftOne = (itemId: string) => {
    dispatch(craftItemOnce(itemId, itemMap[itemId].ingredients));
  };

  const materialsNeeded: Record<string, number> = {};
  operatorGoals.forEach((opGoal) => {
    operatorGoalIngredients(opGoal, operatorMap).forEach((ingr) => {
      const { id, quantity } = ingr;
      materialsNeeded[id] = (materialsNeeded[id] ?? 0) + quantity;
      if (itemsBeingCrafted[id]) {
        itemMap[id].ingredients.forEach((subIngr) => {
          const { id: subIngrId, quantity: subIngrQuantity } = subIngr;
          materialsNeeded[subIngrId] =
            (materialsNeeded[subIngrId] ?? 0) + subIngrQuantity * quantity;
        });
      }
    });
  });

  return (
    <>
      <h3>Items needed</h3>
      <ul>
        {Object.entries(materialsNeeded).map(([id, needed]) => (
          <li key={id}>
            {itemMap[id].name}: {needed}
            <br />
            Have:{" "}
            <input
              type="numeric"
              onChange={(e) => handleChangeQuantity(id, Number(e.target.value))}
              value={quantities[id] ?? 0}
            />
            <br />
            <button type="button" onClick={() => handleIncrement(id)}>
              Increment
            </button>
            <br />
            <button
              type="button"
              onClick={() => handleDecrement(id)}
              disabled={quantities[id] == null || quantities[id] === 0}
            >
              Decrement
            </button>
            {itemMap[id].ingredients.length > 0 ? (
              <button type="button" onClick={() => handleToggleCrafting(id)}>
                {itemsBeingCrafted[id] ? "Stop Crafting" : "Start Crafting"}
              </button>
            ) : (
              "Uncraftable"
            )}
          </li>
        ))}
      </ul>
    </>
  );
};
export default ItemNeededList;
