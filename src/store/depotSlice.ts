/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DepotState {
  quantities: { [itemId: string]: number };
  itemsBeingCrafted: string[];
}

const initialState: DepotState = {
  quantities: {},
  itemsBeingCrafted: [],
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
      if (state.itemsBeingCrafted.includes(action.payload)) {
        state.itemsBeingCrafted = state.itemsBeingCrafted.filter(
          (itemId) => itemId !== action.payload
        );
      } else {
        state.itemsBeingCrafted.push(action.payload);
      }
    },
    // craftItemOnce: (state, action: PayloadAction<string>) => {
    // TODO
    // },
  },
});

export const {
  incrementItemQuantity,
  decrementItemQuantity,
  resetAllQuantities,
  setItemQuantity,
  toggleItemCrafting,
} = depotSlice.actions;

export default depotSlice.reducer;
