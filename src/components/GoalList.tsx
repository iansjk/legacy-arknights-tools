import React, { useMemo } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { OperatorGoalType } from "../store/goalsSlice";
import { useAppSelector } from "../store/store";
import { Operator } from "../types";

const GoalList: React.VFC = () => {
  const data = useStaticQuery(
    graphql`
      query {
        allOperatorsJson(
          sort: { fields: name, order: ASC }
          filter: { rarity: { gte: 3 } }
        ) {
          nodes {
            id
            name
            rarity
          }
        }
      }
    `
  );
  const operators: Record<string, Operator> = useMemo(
    () =>
      Object.fromEntries(
        data.allOperatorsJson.nodes.map((op: Operator) => [op.id, op])
      ),
    [data.allOperatorsJson.nodes]
  );
  const goals = useAppSelector((state) => state.goals);
  return (
    <ul>
      {goals.operators.map(({ operatorId, goal }) => (
        <li key={`${operatorId}-g${goal}`}>
          {operators[operatorId].name}: {OperatorGoalType[goal]}
        </li>
      ))}
    </ul>
  );
};
export default GoalList;
