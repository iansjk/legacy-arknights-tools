import React, { useContext } from "react";
import FocusedIcon from "@material-ui/icons/Star";
import NotFocusedIcon from "@material-ui/icons/StarBorder";
import CompleteGoalIcon from "@material-ui/icons/CheckCircle";
import DeleteGoalIcon from "@material-ui/icons/Cancel";
import { Paper, Typography } from "@material-ui/core";
import { OperatorGoalState, OperatorGoalType } from "../store/goalsSlice";
import PlannerContext from "./PlannerContext";

export type OperatorGoalCardProps = OperatorGoalState;

const OperatorGoalCard: React.VFC<OperatorGoalCardProps> = (props) => {
  const { operatorId, goal } = props;
  const { operatorMap } = useContext(PlannerContext);
  const operator = operatorMap[operatorId];
  return (
    <Paper elevation={3}>
      <Typography component="span" variant="h6">
        {operator.name}
      </Typography>
      {OperatorGoalType[goal]}
    </Paper>
  );
};
export default OperatorGoalCard;
