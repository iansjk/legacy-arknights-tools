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

enum OperatorGoalType {
  Elite1 = 0, // yes this is the default but let's be explicit
  Elite2,
  Skill1Mastery1,
  Skill1Mastery2,
  Skill1Mastery3,
  Skill2Mastery1,
  Skill2Mastery2,
  Skill2Mastery3,
  Skill3Mastery1,
  Skill3Mastery2,
  Skill3Mastery3,
  SkillLevel2,
  SkillLevel3,
  SkillLevel4,
  SkillLevel5,
  SkillLevel6,
  SkillLevel7,
  // so in the future, if e.g. the term "mastery" gets renamed to "specialization",
  // we could just edit the symbol here while the backing state values should stay the same
  // (e.g. Skill1Mastery1 would be renamed to Skill1Specialization1, but its state value should still be 2)
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
      state.operators[action.payload.operatorId].push(action.payload.goal);
    },
    deleteGoal: (state, action: PayloadAction<GoalPayload>) => {
      state.operators[action.payload.operatorId] = state.operators[
        action.payload.operatorId
      ].filter((goal) => goal !== action.payload.goal);
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

export default goalsSlice.reducer;
