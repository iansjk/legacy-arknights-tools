import React from "react";
import { operatorGoalIngredients } from "../pages/planner";
import {
  completeGoal,
  deleteGoal,
  OperatorGoal,
  OperatorGoalType,
  toggleFavorite,
} from "../store/goalsSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { Item, Operator } from "../types";

interface Props {
  operatorMap: Record<string, Operator>;
  itemMap: Record<string, Item>;
}

const GoalList: React.VFC<Props> = ({ operatorMap, itemMap }) => {
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals);

  const handleDelete = (opGoal: OperatorGoal) => {
    dispatch(deleteGoal(opGoal));
  };

  const handleComplete = (opGoal: OperatorGoal) => {
    dispatch(
      completeGoal({
        ...opGoal,
        ingredients: operatorGoalIngredients(opGoal, operatorMap),
      })
    );
  };

  const handleToggleFavorite = (opGoal: OperatorGoal) => {
    dispatch(toggleFavorite(opGoal));
  };

  return (
    <ol>
      {goals.operators.map((opGoal) => {
        const { operatorId, goal } = opGoal;
        return (
          <li key={`${operatorId}-g${goal}`}>
            {operatorMap[operatorId].name}: {OperatorGoalType[goal]}
            <br />
            <button type="button" onClick={() => handleDelete(opGoal)}>
              Delete
            </button>
            <br />
            <button type="button" onClick={() => handleComplete(opGoal)}>
              Complete
            </button>
            <button type="button" onClick={() => handleToggleFavorite(opGoal)}>
              {opGoal.favorite ? "Remove" : "Add"} Favorite
            </button>
          </li>
        );
      })}
    </ol>
  );
};
export default GoalList;
