import React, { useContext } from "react";
import { Box } from "@material-ui/core";
import { eliteImageSrc, masteryImageSrc, skillImageSrc } from "../images";
import { OperatorGoalState, OperatorGoalType } from "../store/goalsSlice";
import PlannerContext from "./PlannerContext";

const ICON_SIZE = 30;

export type OperatorGoalIconographyProps = Omit<OperatorGoalState, "focused">;

const OperatorGoalIconography: React.VFC<OperatorGoalIconographyProps> = (
  props
) => {
  const { operatorId, goal } = props;
  const { operatorMap } = useContext(PlannerContext);

  switch (goal) {
    case OperatorGoalType["Elite 1"]:
    case OperatorGoalType["Elite 2"]:
      return (
        <Box component="span" aria-hidden="true" lineHeight={0}>
          <img
            src={eliteImageSrc(goal === OperatorGoalType["Elite 1"] ? 1 : 2)}
            alt=""
            height={ICON_SIZE}
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
        <Box component="span" aria-hidden="true" lineHeight={0}>
          <img src={skillImageSrc(iconId, skillId)} alt="" height={ICON_SIZE} />
          <img
            src={masteryImageSrc(masteryLevel as 1 | 2 | 3)}
            alt=""
            height={ICON_SIZE}
          />
        </Box>
      );
    }
    default:
      return null;
  }
};
export default OperatorGoalIconography;
