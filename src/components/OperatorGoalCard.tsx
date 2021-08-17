import React from "react";
import FocusedIcon from "@material-ui/icons/Star";
import NotFocusedIcon from "@material-ui/icons/StarBorder";
import CompleteGoalIcon from "@material-ui/icons/CheckCircle";
import DeleteGoalIcon from "@material-ui/icons/Cancel";
import { Paper } from "@material-ui/core";
import { OperatorGoalState, OperatorGoalType } from "../store/goalsSlice";

export type OperatorGoalCardProps = OperatorGoalState;

const OperatorGoalCard: React.VFC<OperatorGoalCardProps> = (props) => {
  const { operatorId, goal } = props;
  return (
    <Paper elevation={3}>
      <Typography component="span" variant="h6">
        {operatorId}
      </Typography>
      {OperatorGoalType[goal]}
    </Paper>
  );
};
export default OperatorGoalCard;
