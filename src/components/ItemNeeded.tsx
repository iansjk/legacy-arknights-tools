import React, { useContext } from "react";
import { Box, makeStyles } from "@material-ui/core";
import { itemBgSrc, itemImageSrc } from "../images";
import PlannerContext from "./PlannerContext";

const useStyles = makeStyles({
  itemBg: {
    backgroundRepeat: "no-repeat",
  },
});

export interface ItemNeededProps {
  itemId: string;
  needed: number;
  owned: number;
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
      style={{ backgroundImage: `url("${itemBgSrc(item.tier)}")` }}
    >
      <img src={itemImageSrc(item.name)} alt={item.name} />
    </Box>
  );
};
export default ItemNeeded;
