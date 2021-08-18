import baseSlugify from "slugify";
import { OperatorGoalState, OperatorGoalType } from "./store/goalsSlice";
import { Operator, Ingredient } from "./types";

export function slugify(toSlug: string): string {
  return baseSlugify(toSlug, { lower: true, replacement: "-", remove: /-/g });
}

export const getOperatorImagePublicId = (
  name: string,
  eliteLevel?: number
): string => {
  let slug = `${slugify(name)}`;
  if (name === "Amiya" && eliteLevel === 1) {
    slug = `${slugify(`${name} elite 1`)}`;
  }
  if (eliteLevel === 2) {
    slug = `${slugify(`${name} elite 2`)}`;
  }
  return `/arknights/operators/${slug}`;
};

export const operatorGoalIngredients = (
  operatorGoal: OperatorGoalState,
  operatorMap: Record<string, Operator>
): Ingredient[] => {
  const { goal, operatorId } = operatorGoal;
  let ingredients = [];
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
  return ingredients;
};
