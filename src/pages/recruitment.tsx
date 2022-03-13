import React, { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Grid,
  makeStyles,
  TextField,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { Combination } from "js-combinatorics";
import Autocomplete from "@material-ui/lab/Autocomplete";
import RecruitableOperatorChip from "../components/RecruitableOperatorChip";
import recruitmentJson from "../data/recruitment.json";

const TAGS_BY_CATEGORY = {
  Rarity: ["Top Operator", "Senior Operator", "Starter", "Robot"],
  Position: ["Melee", "Ranged"],
  Class: [
    "Caster",
    "Defender",
    "Guard",
    "Medic",
    "Sniper",
    "Specialist",
    "Supporter",
    "Vanguard",
  ],
  Other: [
    "AoE",
    "Crowd-Control",
    "DP-Recovery",
    "DPS",
    "Debuff",
    "Defense",
    "Fast-Redeploy",
    "Healing",
    "Nuker",
    "Shift",
    "Slow",
    "Summon",
    "Support",
    "Survival",
  ],
};
const options = Object.entries(TAGS_BY_CATEGORY).flatMap(([type, tagArray]) =>
  tagArray.flatMap((tag) => ({ type, value: tag }))
);

function getTagCombinations(activeTags: string[]) {
  if (activeTags.length === 0) {
    return [];
  }
  const range = Array(activeTags.length)
    .fill(0)
    .map((_, i) => i + 1);
  return range.flatMap((k) =>
    [...new Combination<string>(activeTags, k)].sort()
  );
}

const useStyles = makeStyles((theme) => ({
  chipContainer: {
    gap: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  recruitmentResult: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    "& ~ &": {
      borderTop: "1px solid #4d4d4d",
      paddingTop: theme.spacing(2),
    },
  },
  guaranteeChip: {
    background: "white",
    color: "black",
  },
}));

interface RecruitmentResult {
  tags: string[];
  operators: {
    name: string;
    rarity: number;
    tags: string[];
  }[];
  guarantees: number[];
}

function Recruitment(): React.ReactElement {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const classes = useStyles();
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const activeTagCombinations = getTagCombinations(activeTags);
  const matchingOperators: RecruitmentResult[] = useMemo(
    () =>
      activeTagCombinations.map(
        (tags) =>
          recruitmentJson[tags.toString() as keyof typeof recruitmentJson]
      ),
    [activeTagCombinations]
  );

  function handleTagsChanged(
    _: unknown,
    selectedOptions: {
      type: string;
      value: string;
    }[]
  ) {
    if (selectedOptions.length <= 5) {
      setActiveTags(selectedOptions.map((option) => option.value).sort());
    }
    if (selectedOptions.length === 5) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Autocomplete
        key="input"
        options={options}
        multiple
        autoHighlight
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        groupBy={(option) => option.type}
        getOptionLabel={(option) => option.value}
        disableCloseOnSelect
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus
            label="Available recruitment tags"
            variant="outlined"
          />
        )}
        onChange={handleTagsChanged}
      />
      {matchingOperators
        .sort(
          (
            { tags: tagSetA, operators: opSetA },
            { tags: tagSetB, operators: opSetB }
          ) =>
            Math.min(...opSetB.map((op) => (op.rarity === 1 ? 4 : op.rarity))) -
              Math.min(
                ...opSetA.map((op) => (op.rarity === 1 ? 4 : op.rarity))
              ) || tagSetB.length - tagSetA.length
        )
        .map(({ tags, operators, guarantees }) => (
          <Grid
            container
            className={classes.recruitmentResult}
            spacing={2}
            key={tags.join(",")}
          >
            <Box
              key="tags"
              clone
              justifyContent={isXSmallScreen ? "center" : "flex-end"}
            >
              <Grid item xs={12} sm={3} className={classes.chipContainer}>
                {guarantees.map((guaranteedRarity) => (
                  <Chip
                    className={classes.guaranteeChip}
                    key={`guaranteed${guaranteedRarity}`}
                    label={`${guaranteedRarity}★`}
                  />
                ))}
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} />
                ))}
              </Grid>
            </Box>
            <Grid
              item
              xs={12}
              sm={9}
              className={classes.chipContainer}
              key="operators"
            >
              {operators.map(({ name, rarity, tags: operatorTags }) => (
                <RecruitableOperatorChip
                  key={name}
                  {...{ name, rarity, tags: operatorTags }}
                />
              ))}
            </Grid>
          </Grid>
        ))}
    </>
  );
}
export default Recruitment;
