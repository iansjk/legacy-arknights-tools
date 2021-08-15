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
import React, { useMemo, useState, useEffect } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { useFirebase } from "react-redux-firebase";
import {
  addGoals,
  OperatorGoal,
  OperatorGoalType,
  replaceGoalsFromRemote,
} from "../store/goalsSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { Ingredient, Item, Operator } from "../types";
import GoalList from "../components/GoalList";
import ItemNeededList from "../components/ItemNeededList";
import { replaceDepotFromRemote } from "../store/depotSlice";

export const operatorGoalIngredients = (
  operatorGoal: OperatorGoal,
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

const toMenuItem = (goal: OperatorGoalType) => (
  <MenuItem key={goal} value={goal}>
    {OperatorGoalType[goal]}
  </MenuItem>
);

const Planner: React.VFC = () => {
  const data = useStaticQuery(
    graphql`
      query {
        allItemsJson {
          nodes {
            id
            name
            ingredients {
              id
              quantity
            }
            sortId
            sanityValue
            tier
            yield
            stages {
              leastSanity {
                dropRate
                itemSanityCost
                stageName
                stageSanityCost
              }
              mostEfficient {
                dropRate
                itemSanityCost
                stageName
                stageSanityCost
              }
            }
          }
        }
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
                id
                quantity
              }
            }
            skillLevels {
              goalCategory
              goalName
              goalShortName
              skillLevel
              ingredients {
                id
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
                  id
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
  const operatorMap = useMemo(
    () => Object.fromEntries<Operator>(operators.map((op) => [op.id, op])),
    [operators]
  );
  const items: Item[] = data.allItemsJson.nodes;
  const itemMap = useMemo(
    () => Object.fromEntries<Item>(items.map((item) => [item.id, item])),
    [items]
  );
  const dispatch = useAppDispatch();
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const operator = operatorId == null ? null : operatorMap[operatorId];
  const [selectedGoals, setSelectedGoals] = useState<OperatorGoalType[]>([]);

  const firebase = useFirebase();
  const profile = useAppSelector((state) => state.firebase.profile);

  useEffect(() => {
    console.log("in useEffect (profile updated)");
    if (profile.goals) {
      dispatch(replaceGoalsFromRemote(profile.goals));
    }
    if (profile.depot) {
      dispatch(replaceDepotFromRemote(profile.depot));
    }
  }, [dispatch, profile]);

  const handleOperatorChanged = (_: unknown, value: Operator | null) => {
    setOperatorId(value?.id ?? null);
    setSelectedGoals([]);
  };

  const handleSelectedGoalsChanged = (e: { target: { value: unknown } }) => {
    setSelectedGoals(
      (e.target.value as unknown[]).filter(
        (value) => value != null
      ) as OperatorGoalType[]
    );
  };

  const handleAddGoals = () => {
    if (operator) {
      dispatch(
        addGoals(
          selectedGoals.map((goal) => ({ goal, operatorId: operator.id }))
        )
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
          options={operators}
          getOptionLabel={(op) => op.name}
          autoComplete
          autoHighlight
          value={operator}
          onChange={handleOperatorChanged}
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
                {!operator ? (
                  <MenuItem>Please select an operator first.</MenuItem>
                ) : (
                  [
                    <ListSubheader key="elite">Elite Levels</ListSubheader>,
                    ...possibleGoals
                      .filter(
                        (goal) =>
                          goal === OperatorGoalType["Elite 1"] ||
                          goal === OperatorGoalType["Elite 2"]
                      )
                      .map(toMenuItem),
                    ...(possibleGoals.includes(
                      OperatorGoalType["Skill 1 Mastery 1"]
                    )
                      ? [
                          <ListSubheader key="masteries">
                            Masteries
                          </ListSubheader>,
                        ]
                      : []),
                    ...possibleGoals
                      .filter(
                        (goal) =>
                          goal >= OperatorGoalType["Skill 1 Mastery 1"] &&
                          goal <= OperatorGoalType["Skill 3 Mastery 3"]
                      )
                      .map(toMenuItem),
                    <ListSubheader key="skillLevels">
                      Skill Levels
                    </ListSubheader>,
                    ...possibleGoals
                      .filter(
                        (goal) =>
                          goal >= OperatorGoalType["Skill Level 1 → 2"] &&
                          goal <= OperatorGoalType["Skill Level 6 → 7"]
                      )
                      .map(toMenuItem),
                  ]
                )}
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
      <Grid item xs={12} container>
        <Grid item xs={7}>
          <ItemNeededList operatorMap={operatorMap} itemMap={itemMap} />
        </Grid>
        <Grid item xs={5}>
          <GoalList operatorMap={operatorMap} itemMap={itemMap} />
        </Grid>
      </Grid>
    </Grid>
  );
};
export default Planner;
