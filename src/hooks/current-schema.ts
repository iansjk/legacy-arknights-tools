import {
  EliteGoal,
  Item,
  MasteryGoal,
  OperatorGoal,
  OperatorGoalCategory,
  SkillLevelGoal,
} from "../types";

export interface SchemaV0 {
  operatorGoals: Array<
    Omit<OperatorGoal | EliteGoal | SkillLevelGoal | MasteryGoal, "skill">
  >;
  materialsOwned: {
    [itemName: string]: number;
  };
  itemsToCraft: {
    [itemName: string]: Item;
  };
}

interface SchemaV1OperatorGoal {
  operatorId: string;
}

interface SchemaV1EliteGoal extends SchemaV1OperatorGoal {
  category: OperatorGoalCategory.Elite;
  eliteLevel: number;
}

interface SchemaV1SkillLevelGoal extends SchemaV1OperatorGoal {
  category: OperatorGoalCategory.SkillLevel;
  skillLevel: number;
}

interface SchemaV1MasteryGoal extends SchemaV1OperatorGoal {
  category: OperatorGoalCategory.Mastery;
  masteryLevel: number;
}

export interface SchemaV1 {
  operatorGoals: Array<
    | SchemaV1EliteGoal
    | SchemaV1MasteryGoal
    | SchemaV1SkillLevelGoal
    | SchemaV1OperatorGoal
  >;
  materialsOwned: {
    [itemId: string]: number;
  };
  itemsToCraft: {
    [itemId: string]: boolean;
  };
  version: 1;
}
