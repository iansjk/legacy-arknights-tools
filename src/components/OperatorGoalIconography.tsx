import React, { useContext } from "react";
import { Box, makeStyles } from "@material-ui/core";
import cx from "clsx";
import { eliteImageSrc, masteryImageSrc, skillImageSrc } from "../images";
import { OperatorGoalState, OperatorGoalType } from "../store/goalsSlice";
import PlannerContext from "./PlannerContext";

const ICON_SIZE = 30;

const useStyles = makeStyles((theme) => ({
  root: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginRight: theme.spacing(0.5),
  },
  elite1: {
    transform: "translateY(-5px)",
  },
  elite2: {
    transform: "translateY(-2px)",
  },
}));

export type OperatorGoalIconographyProps = Omit<OperatorGoalState, "focused">;

const OperatorGoalIconography: React.VFC<OperatorGoalIconographyProps> = (
  props
) => {
  const { operatorId, goal } = props;
  const { operatorMap } = useContext(PlannerContext);
  const classes = useStyles();

  switch (goal) {
    case OperatorGoalType["Elite 1"]:
      return (
        <Box aria-hidden="true" lineHeight={0} alignSelf="center">
          <img
            className={cx(classes.root, classes.elite1)}
            src={eliteImageSrc(1)}
            alt=""
          />{" "}
        </Box>
      );
    case OperatorGoalType["Elite 2"]:
      return (
        <Box aria-hidden="true" lineHeight={0} alignSelf="center">
          <img
            className={cx(classes.root, classes.elite2)}
            src={eliteImageSrc(2)}
            alt=""
          />
        </Box>
      );
    case OperatorGoalType["Skill 1 Mastery 1"]:
    case OperatorGoalType["Skill 1 Mastery 2"]:
    case OperatorGoalType["Skill 1 Mastery 3"]:
    case OperatorGoalType["Skill 2 Mastery 1"]:
    case OperatorGoalType["Skill 2 Mastery 2"]:
    case OperatorGoalType["Skill 2 Mastery 3"]:
    case OperatorGoalType["Skill 3 Mastery 1"]:
    case OperatorGoalType["Skill 3 Mastery 2"]:
    case OperatorGoalType["Skill 3 Mastery 3"]: {
      const skillIndex = Math.floor(
        (goal - OperatorGoalType["Skill 1 Mastery 1"]) / 3
      );
      const masteryLevel =
        ((goal - OperatorGoalType["Skill 1 Mastery 1"]) % 3) + 1;
      const { iconId, skillId } = operatorMap[operatorId].skills[skillIndex];
      return (
        <Box aria-hidden="true" lineHeight={0} alignSelf="center">
          <img
            src={skillImageSrc(iconId, skillId)}
            alt=""
            className={classes.root}
          />
          <img
            src={masteryImageSrc(masteryLevel as 1 | 2 | 3)}
            alt=""
            className={classes.root}
          />
        </Box>
      );
    }
    default:
      return null;
  }
};
export default OperatorGoalIconography;
