/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/*
  what is the absolute minimum state that we need to track a user's goals? 
  although this is named "goals", we're really talking about operator goals at the moment.
  but there's no reason why e.g. we could have a leveling goal, or a base building goal,
  and so on.

  it seems premature to add a "type" property to a single goal. what if we instead did something like
  goals: {
    operators: {
      [operatorId: string]: OperatorGoalType[]
    }
    (future keys could be added here for other goal types)
  }

  where OperatorGoalType is some fixed set of values, like
  - Elite 1/2
  - Skill 1/2/3 Mastery 1/2/3
  - SkillLevel 2-7 (SkillLevel1 isn't a goal as that's the start point)

  we just want to avoid getting stuck with e.g. operators getting renamed,
  "elite" or "mastery" being renamed, elite 3 being added (!), etc.
  we could also expand it with Modules if we end up needing materials for those...
  and so on.
*/

export enum OperatorGoalType {
  "Elite 1" = 0, // yes this is the default but let's be explicit
  "Elite 2",
  "Skill 1 Mastery 1",
  "Skill 1 Mastery 2",
  "Skill 1 Mastery 3",
  "Skill 2 Mastery 1",
  "Skill 2 Mastery 2",
  "Skill 2 Mastery 3",
  "Skill 3 Mastery 1",
  "Skill 3 Mastery 2",
  "Skill 3 Mastery 3",
  "Skill Level 1 → 2",
  "Skill Level 2 → 3",
  "Skill Level 3 → 4",
  "Skill Level 4 → 5",
  "Skill Level 5 → 6",
  "Skill Level 6 → 7",
  // so in the future, if e.g. the term "mastery" gets renamed to "specialization",
  // we could just edit the symbol here while the backing state values should stay the same
  // (e.g. Skill 1 Mastery 1 would be renamed to Skill 1 Specialization 1, but its state value should still be 2)
  // working with these enums will be pretty annoying but maybe it's worth it?
}

export interface GoalsState {
  operators: {
    [operatorId: string]: OperatorGoalType[];
  };
}

const initialState: GoalsState = {
  operators: {},
};

interface GoalPayload {
  operatorId: string;
  goal: OperatorGoalType;
}

export const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {
    addGoal: (state, action: PayloadAction<GoalPayload>) => {
      const { goal, operatorId } = action.payload;
      state.operators[operatorId] = [
        ...(state.operators[operatorId] || []),
        goal,
      ];
    },
    deleteGoal: (state, action: PayloadAction<GoalPayload>) => {
      const { goal: toDelete, operatorId } = action.payload;
      if (state.operators[operatorId]?.length > 0) {
        state.operators[operatorId] = state.operators[operatorId].filter(
          (goal) => goal !== toDelete
        );
      }
    },
    deleteAllGoals: (state) => {
      state = initialState;
    },
    // completeGoal: (state) => {
    // TODO this one is going to be pretty complicated.
    // we're going to want to dispatch an action to depotSlice so that it can update its material counts
    // and then also remove the goal from goalsSlice.
    // so I guess it'll be a thunk in the future?
    // }
  },
});

export const { addGoal, deleteGoal, deleteAllGoals } = goalsSlice.actions;

export default goalsSlice.reducer;
