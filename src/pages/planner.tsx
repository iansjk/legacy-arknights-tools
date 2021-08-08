import {
  Box,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ListSubheader,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useState } from "react";
import { useStaticQuery, graphql } from "gatsby";
import GoalOverview from "../components/GoalOverview";
import OperatorGoalIconography from "../components/OperatorGoalIconography";
import {
  isEliteGoal,
  isMasteryGoal,
  Operator,
  OperatorSkill,
  OperatorGoal,
  Goal,
} from "../types";
import { addGoal, OperatorGoalType } from "../store/goalsSlice";
import { useAppDispatch } from "../store/store";

const possibleGoalsForOperator = (
  rarity: number,
  id: string
): OperatorGoalType[] => {
  const possible: OperatorGoalType[] = [];
  if (rarity === 6 || id === "char_002_amiya") {
    possible.push(
      OperatorGoalType["Skill 3 Mastery 1"],
      OperatorGoalType["Skill 3 Mastery 2"],
      OperatorGoalType["Skill 3 Mastery 3"]
    );
  }
  if (rarity >= 4) {
    possible.push(
      OperatorGoalType["Elite 2"],
      OperatorGoalType["Skill 1 Mastery 1"],
      OperatorGoalType["Skill 1 Mastery 2"],
      OperatorGoalType["Skill 1 Mastery 3"],
      OperatorGoalType["Skill 2 Mastery 1"],
      OperatorGoalType["Skill 2 Mastery 2"],
      OperatorGoalType["Skill 2 Mastery 3"]
    );
  }
  if (rarity >= 3) {
    possible.push(
      OperatorGoalType["Elite 1"],
      OperatorGoalType["Skill Level 1 → 2"],
      OperatorGoalType["Skill Level 2 → 3"],
      OperatorGoalType["Skill Level 3 → 4"],
      OperatorGoalType["Skill Level 4 → 5"],
      OperatorGoalType["Skill Level 5 → 6"],
      OperatorGoalType["Skill Level 6 → 7"]
    );
  }
  return possible.sort((a, b) => a - b);
};

function Planner(): React.ReactElement {
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
            elite {
              eliteLevel
              goalCategory
              goalName
              ingredients {
                name
                tier
                quantity
              }
            }
            skillLevels {
              goalCategory
              goalName
              goalShortName
              skillLevel
              ingredients {
                name
                tier
                quantity
              }
            }
            skills {
              iconId
              masteries {
                goalCategory
                goalName
                goalShortName
                ingredients {
                  name
                  tier
                  quantity
                }
                masteryLevel
              }
              skillId
              skillName
            }
          }
        }
      }
    `
  );
  const operators: Operator[] = data.allOperatorsJson.nodes;
  const dispatch = useAppDispatch();
  const [operatorName, setOperatorName] = useState<string>("");
  const operator = operators.find((op) => op.name === operatorName);
  const [selectedGoals, setSelectedGoals] = useState<OperatorGoalType[]>([]);

  const handleOperatorNameChanged = (_: unknown, value: string | null) => {
    if (value) {
      setOperatorName(value);
      setSelectedGoals([]);
    }
  };

  const handleSelectedGoalsChanged = (e: { target: { value: unknown } }) => {
    setSelectedGoals(e.target.value as OperatorGoalType[]);
  };

  const handleAddGoals = () => {
    if (operator) {
      selectedGoals.forEach((goal) =>
        dispatch(addGoal({ goal, operatorId: operator.id }))
      );
      setSelectedGoals([]);
    }
  };

  const possibleGoals = operator
    ? possibleGoalsForOperator(operator.rarity, operator.id)
    : [];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Autocomplete
          options={operators.map((op) => op.name)}
          autoComplete
          autoHighlight
          value={operatorName}
          onChange={handleOperatorNameChanged}
          id="operator-name"
          renderInput={(params) => (
            <TextField
              {...params}
              name="operator-name"
              label="Operator name"
              variant="outlined"
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={8}>
        <Box display="flex">
          <Box mr={2} flexGrow={1} minWidth={0} width="100%">
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="goal-select">Goals</InputLabel>
              <Select
                id="goal-select"
                name="goal-select"
                autoWidth
                multiple
                displayEmpty
                MenuProps={{
                  getContentAnchorEl: null,
                  anchorOrigin: {
                    vertical: "bottom" as const,
                    horizontal: "left" as const,
                  },
                  transformOrigin: {
                    vertical: "top" as const,
                    horizontal: "left" as const,
                  },
                }}
                onChange={handleSelectedGoalsChanged}
                value={selectedGoals}
              >
                {possibleGoals.map((type) => (
                  <MenuItem value={type}>{OperatorGoalType[type]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddGoals}
          >
            Add
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12}>
        {/* <GoalOverview
          goals={operatorGoals}
          onGoalDeleted={handleGoalDeleted}
          onClearAllGoals={handleClearAllGoals}
        /> */}
      </Grid>
    </Grid>
  );
}
export default Planner;
