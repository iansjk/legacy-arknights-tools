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
} from "@material-ui/core";
import { DraggableProvided } from "react-beautiful-dnd";
import { OperatorGoalState, OperatorGoalType } from "../store/goalsSlice";
import PlannerContext from "./PlannerContext";
import { operatorImageSrc } from "../images";
import OperatorGoalIconography from "./OperatorGoalIconography";

const AVATAR_SIZE = 32;
export const ITEM_HEIGHT = AVATAR_SIZE + 8 + 8 + 8; // padding-top/-bottom + margin-bottom

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    "list-style-type": "none",
  },
  nameAndGoal: {
    flexGrow: 1,
    display: "flex",
    alignItems: "baseline",
  },
  name: {
    marginRight: theme.spacing(1),
  },
  focusedIcon: {
    fill: "gold",
  },
  completeIcon: {
    transition: "fill .3s ease",
    "&:hover, &:focus": {
      fill: "yellowgreen",
    },
  },
  deleteIcon: {
    transition: "fill .3s ease",
    "&:hover, &:focus": {
      fill: "red",
    },
  },
}));

const combineStyle = (
  provided?: DraggableProvided,
  style?: React.CSSProperties
) => {
  return {
    ...(provided?.draggableProps.style ?? {}),
    ...(style ?? {}),
  };
};

export type OperatorGoalCardProps = OperatorGoalState & {
  onToggleFocus: (opGoal: OperatorGoalState) => void;
  onCompleteGoal: (opGoal: OperatorGoalState) => void;
  onDeleteGoal: (opGoal: OperatorGoalState) => void;
  style?: React.CSSProperties;
  draggableProvided?: DraggableProvided;
};

const OperatorGoalCard: React.VFC<OperatorGoalCardProps> = (props) => {
  const {
    operatorId,
    goal,
    focused,
    onToggleFocus,
    onCompleteGoal,
    onDeleteGoal,
    style,
    draggableProvided,
  } = props;
  const { operatorMap } = useContext(PlannerContext);
  const operator = operatorMap[operatorId];
  const classes = useStyles();
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
  const alterName = operator.name.split(" the ")[1];

  return (
    <div
      className={classes.root}
      ref={draggableProvided?.innerRef}
      {...draggableProvided?.dragHandleProps}
      {...draggableProvided?.draggableProps}
      style={combineStyle(draggableProvided, style)}
    >
      {/* for some reason, <Paper> won't take style={style} so we have to use <Box clone> */}
      <Paper elevation={3} className={classes.paper}>
        <Avatar
          alt=""
          src={operatorImage}
          className={classes.avatar}
          aria-hidden="true"
        />
        <span className={classes.nameAndGoal}>
          <Typography component="span" variant="h6" className={classes.name}>
            {alterName ?? operator.name}
          </Typography>
          <OperatorGoalIconography operatorId={operatorId} goal={goal} />
          <Typography component="span" variant="body1">
            {OperatorGoalType[goal]}
          </Typography>
        </span>
        <IconButton
          aria-label={`${focused ? "Unfocus" : "Focus"} this goal`}
          size="small"
          onClick={() => onToggleFocus({ operatorId, goal, focused })}
        >
          {focused ? (
            <FocusIcon className={classes.focusedIcon} />
          ) : (
            <UnfocusIcon />
          )}
        </IconButton>
        <IconButton
          aria-label="Complete this goal"
          size="small"
          onClick={() => onCompleteGoal({ operatorId, goal, focused })}
        >
          <CompleteGoalIcon className={classes.completeIcon} />
        </IconButton>
        <IconButton
          aria-label="Delete this goal"
          size="small"
          onClick={() => onDeleteGoal({ operatorId, goal, focused })}
        >
          <DeleteGoalIcon className={classes.deleteIcon} />
        </IconButton>
      </Paper>
    </div>
  );
};
export default OperatorGoalCard;
