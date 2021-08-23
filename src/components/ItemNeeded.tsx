import React, {
  ChangeEventHandler,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Box,
  ButtonBase,
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

const useStyles = makeStyles((theme) => ({
  input: {
    "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
      "-webkit-appearance": "none",
      margin: 0,
    },
    "&": {
      "-moz-appearance": "textfield",
    },
    textAlign: "center",
  },
  itemButton: {
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    position: "relative",
    "&:focus, &:active": {
      filter: "brightness(0.5)",
    },
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
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
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  itemId: string;
  needed: number;
  owned: number;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onChange: (itemId: string, value: number) => void;
  onCraftingToggle: (itemId: string) => void;
  onCraftOne: (itemId: string) => void;
  onClick: (e: React.MouseEvent<HTMLButtonElement>, itemId: string) => void;
}

const ItemNeeded: React.VFC<ItemNeededProps> = React.memo((props) => {
  const {
    width,
    height,
    className,
    style,
    itemId,
    needed,
    owned,
    onIncrement,
    onDecrement,
    onChange,
    onCraftingToggle,
    onCraftOne,
    onClick,
  } = props;
  const { itemMap } = useContext(PlannerContext);
  const [ownedString, setOwnedString] = useState<string>(`${owned}`);
  const classes = useStyles();
  const item = itemMap[itemId];
  const inputProps = {
    className: classes.input,
    type: "number",
    min: 0,
    step: 1,
    "aria-label": "Quantity owned",
    "data-cy": "ownedInput",
  };
  const InputProps = {
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
  };

  useEffect(() => {
    if (owned !== 0 || ownedString !== "") {
      setOwnedString(`${owned}`);
    }
  }, [ownedString, owned]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setOwnedString(e.target.value);
    const numberValue = Number(e.target.value);
    if (!Number.isNaN(numberValue)) {
      onChange(itemId, numberValue);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width={width}
      height={height}
      className={className}
      style={style}
    >
      <ButtonBase
        className={classes.itemButton}
        style={{
          backgroundImage: `url("${itemBgSrc(item.tier)}")`,
          width: height - 40,
          height: height - 40,
        }}
        onClick={(e) => onClick(e, itemId)}
        disableRipple
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
      </ButtonBase>
      <TextField
        size="small"
        variant="outlined"
        value={ownedString}
        onFocus={(event) => event.target.select()}
        onChange={handleChange}
        inputProps={inputProps}
        InputProps={InputProps}
      />
    </Box>
  );
});
export default ItemNeeded;
