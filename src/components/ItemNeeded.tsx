import React, { ChangeEventHandler, useContext, useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import IncrementIcon from "@material-ui/icons/AddCircle";
import DecrementIcon from "@material-ui/icons/RemoveCircle";
import { itemBgSrc, itemImageSrc } from "../images";
import PlannerContext from "./PlannerContext";

const DEFAULT_SIZE = 100;

const useStyles = makeStyles((theme) => ({
  itemBg: {
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  needed: {
    position: "absolute",
    right: 0,
    bottom: "10%",
    padding: theme.spacing(0.25, 1.5),
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: theme.palette.text.primary,
  },
}));

export interface ItemNeededProps {
  itemId: string;
  needed: number;
  owned: number;
  size?: number;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onChange: (itemId: string, value: number) => void;
  onCraftingToggle: (itemId: string) => void;
  onCraftOne: (itemId: string) => void;
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
  const [ownedString, setOwnedString] = useState<string>(`${owned}`);
  const classes = useStyles();
  const item = itemMap[itemId];

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setOwnedString(e.target.value);
    const numberValue = Number(e.target.value);
    if (!Number.isNaN(numberValue)) {
      onChange(itemId, numberValue);
    }
  };

  return (
    <Box display="flex" flexDirection="column">
      <div
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
        <Box component="span" boxShadow={3} className={classes.needed}>
          <Typography variant="button" data-cy="quantity">
            {needed}
          </Typography>
        </Box>
      </div>
      <TextField
        size="small"
        fullWidth
        variant="outlined"
        value={ownedString}
        onFocus={(event) => event.target.select()}
        onChange={handleChange}
        inputProps={{
          type: "number",
          min: 0,
          step: 1,
          "aria-label": "Quantity owned",
          "data-cy": "ownedInput",
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                aria-label="remove 1 from owned amount"
                edge="start"
                disabled={owned === 0}
                onClick={() => onDecrement(itemId)}
                data-cy="decrement"
                size="small"
              >
                <DecrementIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="add 1 to owned amount"
                edge="end"
                onClick={() => onIncrement(itemId)}
                data-cy="increment"
                size="small"
              >
                <IncrementIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
export default ItemNeeded;
