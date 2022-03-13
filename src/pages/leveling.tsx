import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  Paper,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import TrendingFlatIcon from "@material-ui/icons/TrendingFlat";
import { Autocomplete } from "@material-ui/lab";
import cx from "classnames";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Operator } from "../types";

import leveling from "../data/leveling.json";
import lmdIcon from "../data/images/lmd.png";
import OperatorImage from "../components/OperatorImage";
import ValidatedTextField from "../components/ValidatedTextField";
import operatorsJson from "../data/operators.json";

const OPERATOR_IMAGE_SIZE = 100;

const useStyles = makeStyles((theme) => ({
  lmdIcon: {
    position: "relative",
    top: 3,
  },
  arrowIcon: {
    fontSize: "3rem",
    color: "rgba(255, 255, 255, 0.8)",
    stroke: "black",
    strokeWidth: "0.2px",
    width: "100%",
  },
  section: {
    padding: theme.spacing(2),
  },
  noOperatorSection: {
    paddingBottom: theme.spacing(3),
  },
  eliteInput: {
    marginBottom: theme.spacing(2),
  },
  costList: {
    paddingLeft: 0,
  },
  costEntry: {
    display: "block",
    "& + &": {
      marginTop: theme.spacing(1),
    },
  },
  cost: {
    whiteSpace: "nowrap",
  },
  subcostList: {
    marginTop: theme.spacing(1),
    "& > li": {
      display: "list-item",
      listStyle: "disc",
    },
  },
}));

interface LevelingCost {
  exp: number;
  lmd: number;
  levelingLmd: number;
  eliteLmd: number;
}

function levelingCost(
  rarity: number,
  startingElite: number,
  startingLevel: number,
  targetElite: number,
  targetLevel: number
): LevelingCost {
  const costsByElite = Array(Math.max(targetElite - startingElite + 1, 0))
    .fill(0)
    .map((_, i) => {
      const elite = startingElite + i;
      const eliteStartingLevel = elite === startingElite ? startingLevel : 1;
      const eliteTargetLevel =
        elite === targetElite
          ? targetLevel
          : leveling.maxLevelByRarity[rarity - 1][elite];
      const exp = leveling.expCostByElite[elite]
        .slice(eliteStartingLevel - 1, eliteTargetLevel - 1)
        .reduce((a, b) => a + b, 0);
      const levelingLmd = leveling.lmdCostByElite[elite]
        .slice(eliteStartingLevel - 1, eliteTargetLevel - 1)
        .reduce((a, b) => a + b, 0);
      const eliteLmd =
        elite === startingElite
          ? 0
          : leveling.eliteLmdCost[rarity - 1][elite - 1];
      return {
        exp,
        lmd: levelingLmd + eliteLmd,
        eliteLmd,
        levelingLmd,
      };
    });
  const initialValue = {
    exp: 0,
    lmd: 0,
    eliteLmd: 0,
    levelingLmd: 0,
  };
  return costsByElite.reduce(
    (a, b) => ({
      exp: a.exp + b.exp,
      lmd: a.lmd + b.lmd,
      eliteLmd: a.eliteLmd + b.eliteLmd,
      levelingLmd: a.levelingLmd + b.levelingLmd,
    }),
    initialValue
  );
}

function maxElite(rarity: number | undefined) {
  if (rarity == null) {
    return 0;
  }
  switch (rarity) {
    case 1:
    case 2:
      return 0;
    case 3:
      return 1;
    default:
      return 2;
  }
}

function maxLevel(rarity: number | undefined, elite: number | undefined) {
  if (rarity == null || elite == null) {
    return 0;
  }
  return leveling.maxLevelByRarity[rarity - 1][elite];
}

const Leveling: React.FC = () => {
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const [startingElite, setStartingElite] = useState(0);
  const [startingLevel, setStartingLevel] = useState(1);
  const [targetElite, setTargetElite] = useState(0);
  const [targetLevel, setTargetLevel] = useState(1);
  const classes = useStyles();
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const operatorNames = useMemo(
    () => Object.keys(operatorsJson).filter((name) => name !== "Amiya (Guard)"),
    []
  );

  const operator: Operator = operatorName
    ? operatorsJson[operatorName as keyof typeof operatorsJson]
    : null;
  const { exp, lmd, levelingLmd, eliteLmd } = operator
    ? levelingCost(
        operator.rarity,
        startingElite,
        startingLevel,
        targetElite,
        targetLevel
      )
    : { exp: 0, lmd: 0, levelingLmd: 0, eliteLmd: 0 };
  const maxStartingLevel = maxLevel(operator?.rarity, startingElite);
  const maxTargetLevel = maxLevel(operator?.rarity, targetElite);
  const startingLevelHelpText = operator
    ? `Between 1 and ${maxStartingLevel}`
    : "";
  const targetLevelHelpText = operator ? `Between 1 and ${maxTargetLevel}` : "";

  const handleChangeOperatorName = (_: unknown, value: string | null) => {
    setOperatorName(value);
    if (value != null) {
      const newOperator = operatorsJson[value as keyof typeof operatorsJson];
      const newMaxElite = maxElite(newOperator.rarity);
      if (startingElite > newMaxElite) {
        setStartingElite(newMaxElite);
        setStartingLevel(1);
      }
      if (targetElite > newMaxElite) {
        setTargetElite(newMaxElite);
        setTargetLevel(1);
      }
    }
  };

  const handleChangeStartingElite = (
    e: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    const newStartingElite = parseInt(e.target.value as string, 10);
    setStartingElite(newStartingElite);
    if (targetElite < newStartingElite) {
      setTargetElite(newStartingElite);
    }
  };

  return (
    <Box margin="auto" maxWidth="800px">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            fullWidth
            options={operatorNames}
            autoComplete
            autoHighlight
            value={operatorName}
            onChange={handleChangeOperatorName}
            id="operator-name"
            renderInput={(params) => (
              <TextField
                {...params}
                name="operator-name"
                label="Operator name"
                variant="outlined"
                autoFocus
              />
            )}
          />
        </Grid>
        <Grid item xs={12} container alignItems="center" justify="center">
          <Grid item xs={12} sm={5}>
            <Paper
              elevation={3}
              className={cx(
                classes.section,
                !operator && classes.noOperatorSection
              )}
              component="section"
              data-cy="startPoint"
            >
              <Typography component="h3" variant="h5" gutterBottom>
                Start point
              </Typography>
              <Box display="flex" flexDirection="row">
                <Box mr={2}>
                  <OperatorImage
                    name={operator?.name}
                    elite={startingElite as 0 | 1 | 2 | undefined}
                    size={OPERATOR_IMAGE_SIZE}
                  />
                </Box>
                <Box>
                  <FormControl
                    variant="outlined"
                    size="small"
                    fullWidth
                    className={classes.eliteInput}
                  >
                    <InputLabel htmlFor="starting-elite">
                      Starting elite
                    </InputLabel>
                    <Select
                      disabled={!operator}
                      native
                      value={startingElite}
                      label="Starting elite"
                      onChange={handleChangeStartingElite}
                      inputProps={{
                        name: "starting-elite",
                        id: "starting-elite",
                      }}
                    >
                      <option value={0}>Elite 0</option>
                      {Array(maxElite(operator?.rarity))
                        .fill(0)
                        .map((_, i) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <option key={i + 1} value={i + 1}>
                            Elite {i + 1}
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                  <ValidatedTextField
                    size="small"
                    disabled={!operator}
                    id="starting-level"
                    label="Starting level"
                    type="numeric"
                    defaultValue={startingLevel}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setStartingLevel(parseInt(e.target.value, 10))
                    }
                    revalidateOn={[startingElite]}
                    validator={(value) => {
                      if (!operator) {
                        return true;
                      }
                      const numericValue = parseInt(value, 10);
                      return (
                        !Number.isNaN(numericValue) &&
                        numericValue >= 1 &&
                        numericValue <= maxStartingLevel
                      );
                    }}
                    helperText={startingLevelHelpText}
                    variant="outlined"
                    fullWidth
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            {!isXSmallScreen ? (
              <TrendingFlatIcon className={classes.arrowIcon} />
            ) : (
              <>&nbsp;</>
            )}
          </Grid>
          <Grid item xs={12} sm={5}>
            <Paper
              elevation={3}
              className={cx(
                classes.section,
                !operator && classes.noOperatorSection
              )}
              component="section"
              data-cy="endPoint"
            >
              <Typography component="h3" variant="h5" gutterBottom>
                End point
              </Typography>
              <Box display="flex" flexDirection="row">
                <Box mr={2}>
                  <OperatorImage
                    name={operator?.name}
                    elite={targetElite as 0 | 1 | 2 | undefined}
                    size={OPERATOR_IMAGE_SIZE}
                  />
                </Box>
                <Box>
                  <FormControl
                    variant="outlined"
                    size="small"
                    fullWidth
                    className={classes.eliteInput}
                  >
                    <InputLabel htmlFor="target-elite">Target elite</InputLabel>
                    <Select
                      disabled={!operator}
                      native
                      value={targetElite}
                      label="Target elite"
                      onChange={(e) => {
                        setTargetElite(parseInt(e.target.value as string, 10));
                      }}
                      inputProps={{
                        name: "target-elite",
                        id: "target-elite",
                      }}
                    >
                      <option value={0}>Elite 0</option>
                      {Array(maxElite(operator?.rarity))
                        .fill(0)
                        .map((_, i) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <option key={i + 1} value={i + 1}>
                            Elite {i + 1}
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                  <ValidatedTextField
                    size="small"
                    disabled={!operator}
                    id="target-level"
                    label="Target level"
                    type="numeric"
                    defaultValue={targetLevel}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setTargetLevel(parseInt(e.target.value, 10))
                    }
                    revalidateOn={[targetElite]}
                    validator={(value) => {
                      if (!operator) {
                        return true;
                      }
                      const numericValue = parseInt(value, 10);
                      return (
                        !Number.isNaN(numericValue) &&
                        numericValue >= 1 &&
                        numericValue <= maxTargetLevel
                      );
                    }}
                    helperText={targetLevelHelpText}
                    variant="outlined"
                    fullWidth
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} component="section" className={classes.section}>
            <Typography component="h3" variant="h5" gutterBottom>
              Costs
            </Typography>
            <ul className={classes.costList}>
              <Typography
                variant="body1"
                component="li"
                className={classes.costEntry}
              >
                Total EXP cost:{" "}
                <span className={classes.cost}>
                  <strong data-cy="exp" data-exp={exp}>
                    {exp.toLocaleString()}
                  </strong>{" "}
                  EXP
                </span>
              </Typography>
              <Typography
                variant="body1"
                component="li"
                className={classes.costEntry}
              >
                Total LMD cost:{" "}
                <span className={classes.cost}>
                  <strong data-cy="lmd" data-lmd={lmd}>
                    {lmd.toLocaleString()}
                  </strong>{" "}
                  <Image className={classes.lmdIcon} alt="LMD" src={lmdIcon} />
                </span>
                <ul className={classes.subcostList}>
                  <Typography
                    variant="body1"
                    component="li"
                    className={classes.costEntry}
                  >
                    LMD cost for leveling:{" "}
                    <span className={classes.cost}>
                      <span
                        data-cy="levelingLmd"
                        data-leveling-lmd={levelingLmd}
                      >
                        {levelingLmd.toLocaleString()}
                      </span>{" "}
                      <Image
                        className={classes.lmdIcon}
                        alt="LMD"
                        src={lmdIcon}
                      />
                    </span>
                  </Typography>
                  <Typography
                    variant="body1"
                    component="li"
                    className={classes.costEntry}
                  >
                    LMD cost for elite promotions:{" "}
                    <span className={classes.cost}>
                      <span data-cy="eliteLmd" data-elite-lmd={eliteLmd}>
                        {eliteLmd.toLocaleString()}
                      </span>{" "}
                      <Image
                        className={classes.lmdIcon}
                        alt="LMD"
                        src={lmdIcon}
                      />
                    </span>
                  </Typography>
                </ul>
              </Typography>
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Leveling;
