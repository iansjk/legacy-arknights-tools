import React, { useCallback, useContext, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core";
import {
  Grid as ReactVirtualizedGrid,
  AutoSizer,
  WindowScroller,
} from "react-virtualized";
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
import ItemInfoPopover from "./ItemInfoPopover";

const useStyles = makeStyles((theme) => ({
  list: {
    "& > .ReactVirtualized__Grid__innerScrollContainer": {
      display: "flex",
      flexWrap: "wrap",
    },
  },
  cell: {
    padding: theme.spacing(0, 0, 1, 1),
  },
}));

const itemWidth = 135;
const itemHeight = 125;

const ItemNeededList: React.VFC = () => {
  const dispatch = useAppDispatch();
  const { itemsBeingCrafted, quantities } = useAppSelector(
    (state) => state.depot
  );
  const { operators: operatorGoals } = useAppSelector((state) => state.goals);
  const { itemMap, operatorMap } = useContext(PlannerContext);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [popoverItemId, setPopoverItemId] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const classes = useStyles();
  const theme = useTheme();

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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, itemId: string) => {
      setAnchorEl(e.currentTarget);
      setPopoverItemId(itemId);
      setPopoverOpen(true);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setPopoverOpen(false);
  }, []);

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

  const itemEntries = Object.entries(materialsNeeded).filter(
    ([id]) => id !== "4001"
  ); // LMD

  return (
    <>
      <h3>Items needed</h3>
      <WindowScroller>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <AutoSizer disableHeight>
            {({ width }) => {
              const columnCount = Math.floor(
                width / (itemWidth + theme.spacing())
              );
              return (
                <ReactVirtualizedGrid
                  className={classes.list}
                  width={width}
                  autoHeight
                  height={height}
                  onScroll={onChildScroll}
                  scrollTop={scrollTop}
                  isScrolling={isScrolling}
                  rowHeight={itemHeight + theme.spacing(1)}
                  columnCount={columnCount}
                  columnWidth={itemWidth + theme.spacing(1)}
                  rowCount={Math.ceil(itemEntries.length / columnCount)}
                  cellRenderer={({ key, columnIndex, rowIndex, style }) => {
                    const index = rowIndex * columnCount + columnIndex;
                    if (itemEntries[index]) {
                      const [id, needed] = itemEntries[index];
                      return (
                        <ItemNeeded
                          key={key}
                          width={itemWidth}
                          height={itemHeight}
                          className={classes.cell}
                          style={style}
                          itemId={id}
                          needed={needed}
                          owned={quantities[id] ?? 0}
                          onIncrement={handleIncrement}
                          onDecrement={handleDecrement}
                          onChange={handleChangeQuantity}
                          onCraftOne={handleCraftOne}
                          onCraftingToggle={handleToggleCrafting}
                          onClick={handleClick}
                        />
                      );
                    }
                    return null;
                  }}
                />
              );
            }}
          </AutoSizer>
        )}
      </WindowScroller>
      <ItemInfoPopover
        anchorEl={anchorEl}
        itemId={popoverItemId}
        open={popoverOpen}
        onClose={handleClosePopover}
      />
    </>
  );
};
export default ItemNeededList;
