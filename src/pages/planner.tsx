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
import useLocalStorage from "../hooks/useLocalStorage";

function Planner(): React.ReactElement {
  const data = useStaticQuery(
    graphql`
      query {
        allOperatorsJson(
          sort: { fields: name, order: ASC }
          filter: { rarity: { gte: 3 } }
        ) {
          nodes {
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
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const [goalNames, setGoalNames] = useState<string[]>([] as string[]);
  const [operatorGoals, setOperatorGoals] = useLocalStorage<OperatorGoal[]>(
    "operatorGoals",
    []
  );
  const operator = operators.find((op) => op.name === operatorName);
  const goalSelectMenuProps = {
    getContentAnchorEl: null,
    anchorOrigin: {
      vertical: "bottom" as const,
      horizontal: "left" as const,
    },
    transformOrigin: {
      vertical: "top" as const,
      horizontal: "left" as const,
    },
  };

  const operatorPresets: string[] = [];
  if (operator) {
    if (operator.elite.length > 0 && operator.skillLevels.length > 0) {
      operatorPresets.push("Elite 1, Skill Level 1 → 7");
    }
    if (
      operator.skills.length === 3 &&
      operator.skills[2].masteries.length === 3
    ) {
      operatorPresets.push("Skill 3 Mastery 1 → 3");
    }
    operatorPresets.push("Everything");
  }

  const expandPreset = (presetName: string) => {
    if (operator) {
      let goals: Goal[] = [];
      if (presetName === "Elite 1, Skill Level 1 → 7") {
        goals = [operator.elite[0], ...operator.skillLevels];
      } else if (presetName === "Skill 3 Mastery 1 → 3") {
        goals = operator.skills[2].masteries;
      } else if (presetName === "Everything") {
        goals = [
          ...operator.elite,
          ...operator.skills.flatMap((skill) => skill.masteries),
          ...operator.skillLevels,
        ];
      }
      return goals.map((goal) => goal.goalName);
    }
    return [];
  };

  const handleAddGoals = () => {
    if (!operator) {
      return;
    }
    setOperatorGoals((prevOperatorGoals) => {
      const goalNamesSet = new Set(goalNames);
      const masteries = operator.skills.flatMap((skill) => skill.masteries);
      const goalsToAdd = [
        ...operator.elite,
        ...masteries,
        ...operator.skillLevels,
      ].filter((goal) => goalNamesSet.has(goal.goalName));
      const deduplicated = Object.fromEntries([
        ...prevOperatorGoals.map((opGoal) => [
          `${opGoal.operatorName}${opGoal.goalName}`,
          opGoal,
        ]),
        ...goalsToAdd.map((goal) => {
          const key = `${operatorName}${goal.goalName}`;
          const goalObject = { operatorName, ...goal };
          if (isMasteryGoal(goal)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const slot = parseInt(goal.goalShortName!.charAt(1), 10); // FIXME hacky
            return [
              key,
              Object.assign(goalObject, {
                skill: operator.skills[slot - 1],
              }),
            ];
          }
          return [key, goalObject];
        }),
      ]);
      return Object.values(deduplicated);
    });
    setGoalNames([]);
  };

  const handleGoalDeleted = (toDelete: OperatorGoal) => {
    setOperatorGoals((prevOperatorGoals) =>
      prevOperatorGoals.filter(
        (opGoal) =>
          !(
            opGoal.goalName === toDelete.goalName &&
            opGoal.operatorName === toDelete.operatorName
          )
      )
    );
  };

  const handleClearAllGoals = () => {
    setOperatorGoals([]);
  };

  const handleGoalsChanged = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    setGoalNames((oldGoalNames) => {
      const rawValues = (e.target.value as string[]).filter((name) => !!name);
      const newPresets = rawValues.filter((value) =>
        operatorPresets.find((preset) => preset === value)
      );
      if (newPresets.length > 0) {
        return [...new Set([...oldGoalNames, ...expandPreset(newPresets[0])])];
      }
      return rawValues;
    });
  };

  const handleOperatorNameChanged = (_: unknown, value: string | null) => {
    setOperatorName(value);
    setGoalNames([]);
  };

  const renderGoalMenuItem = (goal: Goal, skill?: OperatorSkill) => {
    let child: React.ReactElement | null = null;
    if (isEliteGoal(goal)) {
      child = (
        <OperatorGoalIconography
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          goal={{ ...goal, operatorName: operatorName! }}
        />
      );
    } else if (isMasteryGoal(goal)) {
      child = (
        <OperatorGoalIconography
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          goal={{ ...goal, operatorName: operatorName! }}
          skill={skill}
        />
      );
    }
    return (
      <MenuItem key={goal.goalName} value={goal.goalName} data-cy="goalOption">
        {child}
        {goal.goalName}
      </MenuItem>
    );
  };

  const renderGoalSelectOptions = () => {
    if (!operatorName || !operator) {
      return <MenuItem>Please select an operator first.</MenuItem>;
    }

    const presets =
      operatorPresets.length > 0
        ? [
            <ListSubheader key="presets">Presets</ListSubheader>,
            ...operatorPresets.map((presetName) => (
              <MenuItem key={presetName} value={presetName} data-cy="preset">
                {presetName}
              </MenuItem>
            )),
          ]
        : [];

    const elite =
      operator.elite.length > 0
        ? [
            <ListSubheader key="elite">Elite Levels</ListSubheader>,
            ...operator.elite.map((goal) => renderGoalMenuItem(goal)),
          ]
        : [];
    const masteries =
      operator.skills.length > 0 && operator.skills[0].masteries.length > 0
        ? [
            <ListSubheader key="masteries">Masteries</ListSubheader>,
            ...operator.skills.map((skill) =>
              skill.masteries.map((goal) => renderGoalMenuItem(goal, skill))
            ),
          ]
        : [];
    const skillLevels =
      operator.skillLevels.length > 0
        ? [
            <ListSubheader key="skillLevels">Skill Levels</ListSubheader>,
            ...operator.skillLevels.map((goal) => renderGoalMenuItem(goal)),
          ]
        : [];
    return [...presets, ...elite, ...masteries, ...skillLevels];
  };

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
                value={goalNames}
                MenuProps={goalSelectMenuProps}
                renderValue={(selected: unknown) =>
                  (selected as string[])
                    .sort((a, b) => a.localeCompare(b))
                    .join(", ")
                }
                onChange={handleGoalsChanged}
              >
                {renderGoalSelectOptions()}
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
        <GoalOverview
          goals={operatorGoals}
          onGoalDeleted={handleGoalDeleted}
          onClearAllGoals={handleClearAllGoals}
        />
      </Grid>
    </Grid>
  );
}
export default Planner;
