import React, { useRef, useState } from "react";
import { useStaticQuery, graphql } from "gatsby";
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

const tagsByCategory = {
  rarity: ["Top Operator", "Senior Operator", "Starter", "Robot"],
  position: ["Melee", "Ranged"],
  classes: [
    "Caster",
    "Defender",
    "Guard",
    "Medic",
    "Sniper",
    "Specialist",
    "Supporter",
    "Vanguard",
  ],
  other: [
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
}));

interface RecruitmentResult {
  tags: string[];
  operators: {
    name: string;
    rarity: number;
    tags: string[];
  }[];
}

function Recruitment(): React.ReactElement {
  const data = useStaticQuery(graphql`
    query {
      allRecruitmentJson {
        nodes {
          tags
          operators {
            name
            rarity
            tags
          }
        }
      }
    }
  `);
  const allRecruitmentResults: RecruitmentResult[] =
    data.allRecruitmentJson.nodes;
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const textinput = useRef(null);
  const classes = useStyles();
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const activeTagCombinations = getTagCombinations(activeTags);
  const matchingOperators = React.useMemo(
    () =>
      allRecruitmentResults.filter((result) =>
        activeTagCombinations.find(
          (tags) => tags.toString() === result.tags.toString()
        )
      ),
    [activeTagCombinations, allRecruitmentResults]
  );

  function handleTagsChanged(_: unknown, value: string[]) {
    if (value.length <= 5) {
      setActiveTags(value);
    }
    if (value.length === 5) {
      setIsOpen(false);
      textinput.current?.blur();
    }
  }

  return (
    <>
      <Autocomplete
        key="input"
        options={Object.values(tagsByCategory).flat()}
        multiple
        autoHighlight
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        disableCloseOnSelect
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={textinput}
            autoFocus
            label="Available recruitment tags"
            variant="outlined"
          />
        )}
        value={activeTags}
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
        .map(({ tags, operators }) => (
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
