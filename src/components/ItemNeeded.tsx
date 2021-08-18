import React, { useContext } from "react";
import { Box, makeStyles } from "@material-ui/core";
import { itemBgSrc, itemImageSrc } from "../images";
import PlannerContext from "./PlannerContext";

const DEFAULT_SIZE = 100;

const useStyles = makeStyles({
  itemBg: {
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
});

export interface ItemNeededProps {
  itemId: string;
  needed: number;
  owned: number;
  size?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: () => void;
  onCraftingToggle: () => void;
  onCraftOne: () => void;
}

const ItemNeeded: React.VFC<ItemNeededProps> = (props) => {
  const {
    itemId,
    needed,
    owned,
    size = DEFAULT_SIZE,
    onIncrement,
    onDecrement,
    onChange,
    onCraftingToggle,
    onCraftOne,
  } = props;
  const { itemMap } = useContext(PlannerContext);
  const item = itemMap[itemId];
  const classes = useStyles();

  return (
    <Box
      className={classes.itemBg}
      style={{
        backgroundImage: `url("${itemBgSrc(item.tier)}")`,
        width: size,
        height: size,
      }}
    >
      <img
        className={classes.itemImage}
        src={itemImageSrc(item.name)}
        alt={item.name}
      />
    </Box>
  );
};
export default ItemNeeded;
