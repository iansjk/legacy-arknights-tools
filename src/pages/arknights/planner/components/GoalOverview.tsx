import {
  Box,
  Card,
  CardContent,
  Grid,
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Divider,
} from "@material-ui/core";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import { useStaticQuery, graphql } from "gatsby";
import React from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { Ingredient, Item, OperatorGoal } from "../types";
import ItemNeeded from "./ItemNeeded";
import OperatorGoalCard from "./OperatorGoalCard";

const useStyles = makeStyles((theme) => ({
  lmdIcon: {
    height: "18px",
    marginLeft: theme.spacing(0.5),
    position: "relative",
    top: theme.spacing(0.25),
  },
  totalCostHeader: {
    fontWeight: "initial",
  },
  OperatorGoalCardsHeaderContent: {
    "&:last-child": {
      paddingBottom: theme.spacing(2),
    },
  },
}));

interface GoalOverviewProps {
  goals: OperatorGoal[];
  onGoalDeleted: (goal: OperatorGoal) => void;
  onClearAllGoals: () => void;
}

const GoalOverview = React.memo(function GoalOverview(
  props: GoalOverviewProps
): React.ReactElement {
  const data = useStaticQuery(graphql`
    query {
      allItemsJson(sort: { order: ASC, fields: tier }) {
        nodes {
          name
          tier
          ingredients {
            name
            quantity
            tier
          }
        }
      }
    }
  `);
  const items: Item[] = data.allItemsJson.nodes;
  const { goals, onGoalDeleted, onClearAllGoals } = props;
  const [materialsOwned, setMaterialsOwned] = useLocalStorage<
    Record<string, number | null>
  >("materialsOwned", {});
  const [itemsToCraft, setItemsToCraft] = useLocalStorage<Record<string, Item>>(
    "itemsToCraft",
    {}
  );
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const classes = useStyles();
  const ingredientMapping: Record<string, Ingredient[]> = {};

  const materialsNeeded: Record<string, number> = {};
  goals.forEach((goal) =>
    goal.ingredients.forEach((item) => {
      materialsNeeded[item.name] =
        item.quantity + (materialsNeeded[item.name] || 0);
    })
  );
  items.forEach((item) => {
    if (
      Object.prototype.hasOwnProperty.call(itemsToCraft, item.name) &&
      Object.prototype.hasOwnProperty.call(materialsNeeded, item.name)
    ) {
      const needed = Math.max(
        materialsNeeded[item.name] - (materialsOwned[item.name] || 0),
        0
      );
      item?.ingredients?.forEach((ingredient) => {
        ingredientMapping[ingredient.name] = [
          ...(ingredientMapping[ingredient.name] || []),
          // FIXME should tier be item.tier or ingredient.tier?
          { name: item.name, tier: item.tier, quantity: ingredient.quantity },
        ];
        materialsNeeded[ingredient.name] =
          (materialsNeeded[ingredient.name] || 0) +
          needed * ingredient.quantity;
      });
    }
  });
  const craftingMaterialsOwned = { ...materialsOwned };
  Object.keys(itemsToCraft)
    .filter(
      (itemName) => materialsNeeded[itemName] && materialsNeeded[itemName] > 0
    )
    .sort((a, b) => itemsToCraft[a].tier - itemsToCraft[b].tier)
    .forEach((craftedItemName) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const ingredients = itemsToCraft[craftedItemName].ingredients!.filter(
        (ingredient) => ingredient.name !== "LMD"
      );
      const numCraftable = Math.min(
        ...ingredients.map((ingredient) => {
          return Math.floor(
            (craftingMaterialsOwned[ingredient.name] || 0) / ingredient.quantity
          );
        })
      );
      ingredients?.forEach((ingredient) => {
        craftingMaterialsOwned[ingredient.name] = Math.max(
          (craftingMaterialsOwned[ingredient.name] || 0) -
            ingredient.quantity * numCraftable,
          0
        );
      });
      materialsNeeded[craftedItemName] = Math.max(
        materialsNeeded[craftedItemName] - numCraftable,
        0
      );
      craftingMaterialsOwned[craftedItemName] =
        (craftingMaterialsOwned[craftedItemName] || 0) + numCraftable;
    });

  const handleIncrementOwned = React.useCallback(
    function handleIncrementOwned(itemName: string): void {
      setMaterialsOwned((prevOwned) => ({
        ...prevOwned,
        [itemName]: 1 + (prevOwned[itemName] || 0),
      }));
    },
    [setMaterialsOwned]
  );

  const handleDecrementOwned = React.useCallback(
    function handleDecrementOwned(itemName: string): void {
      setMaterialsOwned((prevOwned) => ({
        ...prevOwned,
        [itemName]: Math.max(0, (prevOwned[itemName] || 0) - 1),
      }));
    },
    [setMaterialsOwned]
  );

  const handleChangeOwned = React.useCallback(
    function handleChangeOwned(itemName: string, rawInput: string): void {
      const newValue: number | null = !rawInput ? null : parseInt(rawInput, 10);
      if (newValue === null || !Number.isNaN(newValue)) {
        setMaterialsOwned((prevOwned) => ({
          ...prevOwned,
          [itemName]: newValue,
        }));
      }
    },
    [setMaterialsOwned]
  );

  function isMaterialComplete(name: string): boolean {
    let multiplier = 1;
    if (name === "LMD") {
      multiplier = 1000;
    }
    return (materialsOwned[name] || 0) * multiplier >= materialsNeeded[name];
  }

  const handleCraftingToggle = React.useCallback(
    function handleCraftingToggle(item: Item) {
      setItemsToCraft((prevObj) => {
        if (Object.prototype.hasOwnProperty.call(prevObj, item.name)) {
          const newObj = { ...prevObj };
          delete newObj[item.name];
          return newObj;
        }
        return { ...prevObj, [item.name]: item };
      });
    },
    [setItemsToCraft]
  );

  const handleReset = React.useCallback(
    function handleReset() {
      setItemsToCraft({});
      setMaterialsOwned({});
    },
    [setItemsToCraft, setMaterialsOwned]
  );

  function renderItemsNeeded(
    objectEntries: [string, number][]
  ): React.ReactElement[] {
    return objectEntries
      .sort(
        ([nameA, _], [nameB, __]) =>
          (isMaterialComplete(nameA) ? 1 : 0) -
            (isMaterialComplete(nameB) ? 1 : 0) ||
          MATERIALS[nameA].category - MATERIALS[nameB].category ||
          MATERIALS[nameB].tier - MATERIALS[nameA].tier ||
          nameA.localeCompare(nameB)
      )
      .map(([name, needed]) => {
        const inner = (
          <ItemNeeded
            size={isXSmallScreen ? 75 : undefined}
            {...{ name, needed }}
            owned={materialsOwned[name] || 0}
            complete={isMaterialComplete(name)}
            crafting={Object.prototype.hasOwnProperty.call(itemsToCraft, name)}
            ingredientFor={ingredientMapping[name]}
            onIncrement={handleIncrementOwned}
            onDecrement={handleDecrementOwned}
            onChange={handleChangeOwned}
            onCraftingToggle={handleCraftingToggle}
          />
        );
        const outer = isLargeScreen ? (
          <Box key={name} data-testid={name} width="20%" px={0.5} mt={1}>
            {inner}
          </Box>
        ) : (
          <Grid key={name} data-testid={name} item xs={4} sm={3} md={3}>
            {inner}
          </Grid>
        );
        return outer;
      });
  }

  const requiredMaterials = Object.entries(materialsNeeded).filter(
    ([name, _]) => name !== "LMD"
  );

  return (
    <Grid container spacing={2}>
      <Grid component="section" item md={7} data-testid="materialsLists">
        {requiredMaterials.length > 0 && (
          <Card>
            <CardContent>
              <Box clone mb={1}>
                <Grid container>
                  <Grid item xs={8}>
                    <Typography component="h2" variant="h5">
                      Required materials
                    </Typography>
                    <Box my={1} width="90%">
                      <Divider />
                    </Box>
                    <Typography
                      className={classes.totalCostHeader}
                      component="span"
                      variant="h6"
                    >
                      Total cost:&nbsp;
                      <b>{(materialsNeeded.LMD ?? 0).toLocaleString()}</b>
                      <img
                        className={classes.lmdIcon}
                        src={`${process.env.PUBLIC_URL}/images/icons/lmd.png`}
                        alt="LMD"
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="end">
                      <Button
                        variant="outlined"
                        onClick={handleReset}
                        startIcon={<RotateLeftIcon />}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Grid container spacing={1}>
                {renderItemsNeeded(requiredMaterials)}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Grid>
      <Grid component="section" item xs={12} md={5}>
        {goals.length > 0 && (
          <>
            <Box clone mb={1}>
              <Card>
                <CardContent className={classes.OperatorGoalCardsHeaderContent}>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography component="h2" variant="h5">
                        Operator goals
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="end">
                        <Button
                          variant="outlined"
                          onClick={onClearAllGoals}
                          startIcon={<ClearAllIcon />}
                        >
                          Clear All
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
            {goals.map((goal) => (
              <OperatorGoalCard
                key={`${goal.operatorName}${goal.goalName}`}
                goal={goal}
                onDelete={onGoalDeleted}
              />
            ))}
          </>
        )}
      </Grid>
    </Grid>
  );
});
export default GoalOverview;
