export interface Item {
  id: string;
  name: string;
  tier: number;
  ingredients?: Ingredient[];
  yield?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  tier: number;
  quantity: number;
}

export interface Operator {
  id: string;
  name: string;
  class: string;
  rarity: number;
  isCnOnly: boolean;
  elite: EliteGoal[];
  skillLevels: SkillLevelGoal[];
  skills: OperatorSkill[];
}

export interface OperatorSkill {
  skillId: string;
  iconId: string | null;
  skillName: string;
  masteries: MasteryGoal[];
}

export enum OperatorGoalCategory {
  "Elite" = 0,
  "Mastery",
  "Skill Level",
}

export interface Goal {
  goalName: string;
  goalShortName?: string;
  goalCategory: OperatorGoalCategory;
  ingredients: Ingredient[];
  skill?: OperatorSkill; // transient property, set by Planner
}

export type OperatorGoal = Goal & {
  operatorName: string;
};

export type EliteGoal = Goal & {
  eliteLevel: number;
};

export type SkillLevelGoal = Goal & {
  skillLevel: number;
};

export type MasteryGoal = Goal & {
  masteryLevel: number;
};

export function isEliteGoal(goal: Goal): goal is EliteGoal {
  return (
    Object.prototype.hasOwnProperty.call(goal, "eliteLevel") &&
    goal.goalCategory === OperatorGoalCategory.Elite
  );
}

export function isMasteryGoal(goal: Goal): goal is MasteryGoal {
  return (
    Object.prototype.hasOwnProperty.call(goal, "masteryLevel") &&
    goal.goalCategory === OperatorGoalCategory.Mastery
  );
}

export function isSkillLevelGoal(goal: Goal): goal is SkillLevelGoal {
  return (
    Object.prototype.hasOwnProperty.call(goal, "skillLevel") &&
    goal.goalCategory === OperatorGoalCategory["Skill Level"]
  );
}
