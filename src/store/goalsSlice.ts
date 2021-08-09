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

  8/8: I think we have to rethink this approach, if we're planning on eventually letting users
  rearrange their goals, then we need to persist that ordering in the store.
  and if we're persisting the ordering, then we need to persist it as an array of operatorids and goaltypes,
  at which point, why are we even keeping an object?

  now the question is, how would we handle a future scenario where we add e.g. a BaseGoal or something?
  though, if we have redux-persist and migrations, maybe I shouldn't be too worried about it
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

interface OperatorGoal {
  operatorId: string;
  goal: OperatorGoalType;
}

export interface GoalsState {
  operators: OperatorGoal[];
}

const initialState: GoalsState = {
  operators: [],
};

export const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {
    addGoals: (state, action: PayloadAction<OperatorGoal[]>) => {
      const newGoals = action.payload.filter((newGoal) => !state.operators.find((existing) => existing.goal === newGoal.goal && existing.operatorId === newGoal.operatorId));
      state.operators.push(...newGoals);
    },
    deleteGoal: (state, action: PayloadAction<OperatorGoal>) => {
      state.operators = state.operators.filter((opGoal) => !(opGoal.goal !== action.payload.goal && opGoal.operatorId !== action.payload.operatorId));
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

export const { addGoals, deleteGoal, deleteAllGoals } = goalsSlice.actions;

export default goalsSlice.reducer;
