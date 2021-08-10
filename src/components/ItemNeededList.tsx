import React from "react";
import { OperatorGoalType } from "../store/goalsSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { Ingredient, Operator } from "../types";

interface Props {
  operatorMap: Record<string, Operator>;
}

const ItemNeededList: React.VFC<Props> = ({ operatorMap }) => {
  const dispatch = useAppDispatch();
  const { itemsBeingCrafted, quantities } = useAppSelector(
    (state) => state.depot
  );
  const { operators: operatorGoals } = useAppSelector((state) => state.goals);

  const materialsNeeded: Record<string, number> = {};
  operatorGoals.forEach((opGoal) => {
    const { goal, operatorId } = opGoal;
    let ingredients: Ingredient[] = [];
    switch (goal) {
      case OperatorGoalType["Elite 1"]:
      case OperatorGoalType["Elite 2"]:
        ingredients =
          operatorMap[operatorId].elite[goal - OperatorGoalType["Elite 1"]]
            .ingredients;
        break;
      case OperatorGoalType["Skill 1 Mastery 1"]:
      case OperatorGoalType["Skill 1 Mastery 2"]:
      case OperatorGoalType["Skill 1 Mastery 3"]:
        ingredients =
          operatorMap[operatorId].skills[0].masteries[
            goal - OperatorGoalType["Skill 1 Mastery 1"]
          ].ingredients;
        break;
      case OperatorGoalType["Skill 2 Mastery 1"]:
      case OperatorGoalType["Skill 2 Mastery 2"]:
      case OperatorGoalType["Skill 2 Mastery 3"]:
        ingredients =
          operatorMap[operatorId].skills[1].masteries[
            goal - OperatorGoalType["Skill 2 Mastery 1"]
          ].ingredients;
        break;
      case OperatorGoalType["Skill 3 Mastery 1"]:
      case OperatorGoalType["Skill 3 Mastery 2"]:
      case OperatorGoalType["Skill 3 Mastery 3"]:
        ingredients =
          operatorMap[operatorId].skills[2].masteries[
            goal - OperatorGoalType["Skill 3 Mastery 1"]
          ].ingredients;
        break;
      case OperatorGoalType["Skill Level 1 → 2"]:
      case OperatorGoalType["Skill Level 2 → 3"]:
      case OperatorGoalType["Skill Level 3 → 4"]:
      case OperatorGoalType["Skill Level 4 → 5"]:
      case OperatorGoalType["Skill Level 5 → 6"]:
      case OperatorGoalType["Skill Level 6 → 7"]:
        ingredients =
          operatorMap[operatorId].skillLevels[
            goal - OperatorGoalType["Skill Level 1 → 2"]
          ].ingredients;
        break;
      default:
        throw new Error(
          `Unexpected operator goal type: ${OperatorGoalType[goal]}`
        );
    }
    ingredients.forEach((ingr) => {
      const { id, quantity } = ingr;
      materialsNeeded[id] = (materialsNeeded[id] ?? 0) + quantity;
    });
  });
  return (
    <ul>
      {Object.entries(materialsNeeded).map(([id, quantity]) => (
        <li key={id}>
          {id}: {quantity}
        </li>
      ))}
    </ul>
  );
};
export default ItemNeededList;
