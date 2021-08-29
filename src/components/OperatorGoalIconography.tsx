import React from "react";
import { OperatorGoalType } from "../store/goalsSlice";

export interface OperatorGoalIconographyProps {
  goal: OperatorGoalType;
}

const OperatorGoalIconography: React.VFC<OperatorGoalIconographyProps> = (
  props
) => {
  const { goal } = props;
  return <></>;
};
export default OperatorGoalIconography;
