import React, { useContext } from "react";
import FocusIcon from "@material-ui/icons/Star";
import UnfocusIcon from "@material-ui/icons/StarBorder";
import CompleteGoalIcon from "@material-ui/icons/CheckCircle";
import DeleteGoalIcon from "@material-ui/icons/Cancel";
import { IconButton, makeStyles, Paper, Typography } from "@material-ui/core";
import { OperatorGoalState, OperatorGoalType } from "../store/goalsSlice";
import PlannerContext from "./PlannerContext";

const useStyles = makeStyles((theme) => ({
  root: {
    "list-style-type": "none",
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
  },
  nameAndGoal: {
    flexGrow: 1,
  },
  name: {
    marginRight: theme.spacing(1),
  },
}));

export type OperatorGoalCardProps = OperatorGoalState;

const OperatorGoalCard: React.VFC<OperatorGoalCardProps> = (props) => {
  const { operatorId, goal, focused } = props;
  const { operatorMap } = useContext(PlannerContext);
  const operator = operatorMap[operatorId];
  const classes = useStyles();

  return (
    <Paper elevation={3} component="li" classes={classes}>
      <span className={classes.nameAndGoal}>
        <Typography component="span" variant="h6" className={classes.name}>
          {operator.name}
        </Typography>
        <Typography component="span" variant="body1">
          {OperatorGoalType[goal]}
        </Typography>
      </span>
      <IconButton
        aria-label={`${focused ? "Unfocus" : "Focus"} this goal`}
        size="small"
      >
        {focused ? <UnfocusIcon /> : <FocusIcon />}
      </IconButton>
      <IconButton aria-label="Complete this goal" size="small">
        <CompleteGoalIcon />
      </IconButton>
      <IconButton aria-label="Delete this goal" size="small">
        <DeleteGoalIcon />
      </IconButton>
    </Paper>
  );
};
export default OperatorGoalCard;
