import React from "react";
import { OperatorGoalType } from "../store/goalsSlice";
import { useAppSelector } from "../store/store";
import { Operator } from "../types";

interface Props {
  operatorMap: Record<string, Operator>;
}

const GoalList: React.VFC<Props> = ({ operatorMap }) => {
  const goals = useAppSelector((state) => state.goals);
  return (
    <ol>
      {goals.operators.map(({ operatorId, goal }) => (
        <li key={`${operatorId}-g${goal}`}>
          {operatorMap[operatorId].name}: {OperatorGoalType[goal]}
        </li>
      ))}
    </ol>
  );
};
export default GoalList;
