import React, { useCallback, useContext } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import {
  craftItemOnce,
  decrementItemQuantity,
  incrementItemQuantity,
  setItemQuantity,
  toggleItemCrafting,
} from "../store/depotSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { operatorGoalIngredients } from "../utils";
import ItemNeeded from "./ItemNeeded";
import PlannerContext from "./PlannerContext";

const useStyles = makeStyles({
  list: {
    padding: 0,
    listStyle: "none",
  },
});

const ItemNeededList: React.VFC = () => {
  const dispatch = useAppDispatch();
  const { itemsBeingCrafted, quantities } = useAppSelector(
    (state) => state.depot
  );
  const { operators: operatorGoals } = useAppSelector((state) => state.goals);
  const { itemMap, operatorMap } = useContext(PlannerContext);
  const classes = useStyles();

  const handleIncrement = useCallback(
    (itemId: string) => {
      dispatch(incrementItemQuantity(itemId));
    },
    [dispatch]
  );

  const handleDecrement = useCallback(
    (itemId: string) => {
      dispatch(decrementItemQuantity(itemId));
    },
    [dispatch]
  );

  const handleChangeQuantity = useCallback(
    (itemId: string, quantity: number) => {
      dispatch(setItemQuantity({ itemId, quantity }));
    },
    [dispatch]
  );

  const handleToggleCrafting = useCallback(
    (itemId: string) => {
      dispatch(toggleItemCrafting(itemId));
    },
    [dispatch]
  );

  const handleCraftOne = useCallback(
    (itemId: string) => {
      dispatch(craftItemOnce(itemId, itemMap[itemId].ingredients));
    },
    [dispatch, itemMap]
  );

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
      <Grid container component="ul" className={classes.list}>
        {Object.entries(materialsNeeded).map(([id, needed]) => (
          <Grid item component="li">
            <ItemNeeded
              key={id}
              itemId={id}
              needed={needed}
              owned={quantities[id] ?? 0}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onChange={handleChangeQuantity}
              onCraftOne={handleCraftOne}
              onCraftingToggle={handleToggleCrafting}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};
export default ItemNeededList;
