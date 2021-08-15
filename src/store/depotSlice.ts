/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { Ingredient } from "../types";
import { completeGoal } from "./goalsSlice";

interface DepotState {
  quantities: { [itemId: string]: number };
  itemsBeingCrafted: { [itemId: string]: boolean };
}

const initialState: DepotState = {
  quantities: {},
  itemsBeingCrafted: {},
};

interface QuantityPayload {
  itemId: string;
  quantity: number;
}

export const depotSlice = createSlice({
  name: "depot",
  initialState,
  reducers: {
    incrementItemQuantity: (state, action: PayloadAction<string>) => {
      state.quantities[action.payload] =
        (state.quantities[action.payload] ?? 0) + 1;
    },
    decrementItemQuantity: (state, action: PayloadAction<string>) => {
      state.quantities[action.payload] = Math.max(
        (state.quantities[action.payload] ?? 0) - 1,
        0
      );
    },
    setItemQuantity: (state, action: PayloadAction<QuantityPayload>) => {
      state.quantities[action.payload.itemId] = action.payload.quantity;
    },
    resetAll: (state) => {
      state.quantities = {};
      state.itemsBeingCrafted = {};
    },
    toggleItemCrafting: (state, action: PayloadAction<string>) => {
      state.itemsBeingCrafted[action.payload] = !state.itemsBeingCrafted[
        action.payload
      ];
    },
    replaceDepotFromRemote: (_state, action: PayloadAction<DepotState>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(completeGoal, (state, action) => {
      const { ingredients } = action.payload;
      ingredients.forEach((ingr) => {
        state.quantities[ingr.id] = Math.max(
          (state.quantities[ingr.id] ?? 0) - ingr.quantity,
          0
        );
      });
    }),
});

export const {
  incrementItemQuantity,
  decrementItemQuantity,
  resetAll,
  setItemQuantity,
  toggleItemCrafting,
  replaceDepotFromRemote,
} = depotSlice.actions;

export const craftItemOnce = (
  itemId: string,
  ingredients: Ingredient[]
): AppThunk => (dispatch, getState) => {
  const { quantities } = getState().depot;
  ingredients.forEach((ingredient) => {
    dispatch(
      setItemQuantity({
        itemId: ingredient.id,
        quantity: Math.max(
          (quantities[ingredient.id] ?? 0) - ingredient.quantity,
          0
        ),
      })
    );
  });
  dispatch(incrementItemQuantity(itemId));
};

export default depotSlice.reducer;
