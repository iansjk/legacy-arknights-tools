import React, { useContext } from "react";
import FocusIcon from "@material-ui/icons/Star";
import UnfocusIcon from "@material-ui/icons/StarBorder";
import CompleteGoalIcon from "@material-ui/icons/CheckCircle";
import DeleteGoalIcon from "@material-ui/icons/Cancel";
import {
  Avatar,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  useTheme,
} from "@material-ui/core";
import { OperatorGoalState, OperatorGoalType } from "../store/goalsSlice";
import PlannerContext from "./PlannerContext";
import { operatorImageSrc } from "../images";

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: 32,
    height: 32,
    marginRight: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    "list-style-type": "none",
    marginBottom: theme.spacing(1),
  },
  nameAndGoal: {
    flexGrow: 1,
  },
  name: {
    marginRight: theme.spacing(1),
  },
}));

export type OperatorGoalCardProps = OperatorGoalState & {
  onToggleFocus: (opGoal: OperatorGoalState) => void;
  onCompleteGoal: (opGoal: OperatorGoalState) => void;
  onDeleteGoal: (opGoal: OperatorGoalState) => void;
};

const OperatorGoalCard = React.forwardRef<
  HTMLElement,
  OperatorGoalCardProps & React.HTMLAttributes<HTMLElement>
>((props, ref) => {
  const {
    operatorId,
    goal,
    focused,
    onToggleFocus,
    onCompleteGoal,
    onDeleteGoal,
    ...rest
  } = props;
  const { operatorMap } = useContext(PlannerContext);
  const operator = operatorMap[operatorId];
  const classes = useStyles();
  const theme = useTheme();
  let eliteLevel = 0;
  if (
    goal === OperatorGoalType["Elite 2"] ||
    (goal >= OperatorGoalType["Skill 1 Mastery 1"] &&
      goal <= OperatorGoalType["Skill 3 Mastery 3"])
  )
    eliteLevel = 2;
  else if (
    goal === OperatorGoalType["Elite 1"] ||
    (goal >= OperatorGoalType["Skill Level 4 → 5"] &&
      goal <= OperatorGoalType["Skill Level 6 → 7"])
  )
    eliteLevel = 1;
  const operatorImage = operatorImageSrc(operator.name, eliteLevel);

  return (
    <Paper
      elevation={3}
      component="li"
      className={classes.paper}
      ref={ref}
      {...rest}
    >
      <Avatar
        alt=""
        src={operatorImage}
        className={classes.avatar}
        aria-hidden="true"
      />
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
        onClick={() => onToggleFocus({ operatorId, goal, focused })}
      >
        {focused ? <FocusIcon /> : <UnfocusIcon />}
      </IconButton>
      <IconButton
        aria-label="Complete this goal"
        size="small"
        onClick={() => onCompleteGoal({ operatorId, goal, focused })}
      >
        <CompleteGoalIcon />
      </IconButton>
      <IconButton
        aria-label="Delete this goal"
        size="small"
        onClick={() => onDeleteGoal({ operatorId, goal, focused })}
      >
        <DeleteGoalIcon />
      </IconButton>
    </Paper>
  );
});
export default OperatorGoalCard;
