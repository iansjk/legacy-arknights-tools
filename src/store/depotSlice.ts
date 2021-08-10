/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { Ingredient } from "../types";

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
    resetAllQuantities: (state) => {
      state.quantities = {};
    },
    toggleItemCrafting: (state, action: PayloadAction<string>) => {
      state.itemsBeingCrafted[action.payload] = !state.itemsBeingCrafted[
        action.payload
      ];
    },
  },
});

export const {
  incrementItemQuantity,
  decrementItemQuantity,
  resetAllQuantities,
  setItemQuantity,
  toggleItemCrafting,
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
