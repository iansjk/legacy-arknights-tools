import React, { useContext } from "react";
import { Paper, Popover, Typography } from "@material-ui/core";
import PlannerContext from "./PlannerContext";

interface ItemInfoPopoverProps {
  itemId: string;
  anchorEl: HTMLButtonElement | null;
  open: boolean;
  onClose: () => void;
}

const ItemInfoPopover: React.VFC<ItemInfoPopoverProps> = (props) => {
  const { itemId, anchorEl, open, onClose } = props;
  const { itemMap } = useContext(PlannerContext);
  const item = itemMap[itemId];
  const BackdropProps = {
    invisible: false,
  };
  const anchorOrigin = {
    vertical: "center" as const,
    horizontal: "right" as const,
  };
  const transformOrigin = {
    vertical: "center" as const,
    horizontal: "left" as const,
  };

  return (
    <Popover
      BackdropProps={BackdropProps}
      hideBackdrop={false}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
    >
      {item && (
        <Paper elevation={3}>
          <Typography component="h3" variant="h5" gutterBottom>
            {item.name}
          </Typography>
        </Paper>
      )}
    </Popover>
  );
};
export default ItemInfoPopover;
