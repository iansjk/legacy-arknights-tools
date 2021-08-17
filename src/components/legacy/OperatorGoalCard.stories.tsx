/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import { Story, Meta } from "@storybook/react";
import { Grid } from "@material-ui/core";
import OperatorGoalCard, { OperatorGoalCardProps } from "./OperatorGoalCard";

export default {
  title: "Legacy Planner/OperatorGoalCard",
  component: OperatorGoalCard,
} as Meta;

const Template: Story<OperatorGoalCardProps> = (args) => (
  <Grid item xs={12} md={5}>
    <OperatorGoalCard {...args} />
  </Grid>
);

export const SkadiAlterSkill3Mastery3 = Template.bind({});
SkadiAlterSkill3Mastery3.args = {
  goal: {
    operatorName: "Skadi the Corrupting Heart",
    goalCategory: 1,
    goalName: "Skill 3 Mastery 3",
    goalShortName: "S3 M3",
    ingredients: [
      { name: "Skill Summary - 3", tier: 4, quantity: 15 },
      { name: "Polymerization Preparation", tier: 5, quantity: 6 },
      { name: "Incandescent Alloy Block", tier: 4, quantity: 6 },
    ],
    masteryLevel: 3,
  },
  skill: {
    iconId: null,
    masteries: [
      {
        goalCategory: 1,
        goalName: "Skill 3 Mastery 1",
        goalShortName: "S3 M1",
        ingredients: [
          { name: "Skill Summary - 3", tier: 4, quantity: 8 },
          { name: "Orirock Concentration", tier: 4, quantity: 4 },
          { name: "Grindstone", tier: 3, quantity: 7 },
        ],
        masteryLevel: 1,
      },
      {
        goalCategory: 1,
        goalName: "Skill 3 Mastery 2",
        goalShortName: "S3 M2",
        ingredients: [
          { name: "Skill Summary - 3", tier: 4, quantity: 12 },
          { name: "Keton Colloid", tier: 4, quantity: 4 },
          { name: "Polymerized Gel", tier: 4, quantity: 9 },
        ],
        masteryLevel: 2,
      },
      {
        goalCategory: 1,
        goalName: "Skill 3 Mastery 3",
        goalShortName: "S3 M3",
        ingredients: [
          { name: "Skill Summary - 3", tier: 4, quantity: 15 },
          { name: "Polymerization Preparation", tier: 5, quantity: 6 },
          { name: "Incandescent Alloy Block", tier: 4, quantity: 6 },
        ],
        masteryLevel: 3,
      },
    ],
    skillId: "skchr_skadi2_3",
    skillName: '"潮涌，潮枯"',
  },
};

export const AakElite1 = Template.bind({});
AakElite1.args = {
  goal: {
    operatorName: "Aak",
    eliteLevel: 1,
    goalCategory: 0,
    goalName: "Elite 1",
    ingredients: [
      { name: "LMD", tier: 4, quantity: 30000 },
      { name: "Specialist Chip", tier: 3, quantity: 5 },
      { name: "Sugar", tier: 2, quantity: 8 },
      { name: "Oriron", tier: 2, quantity: 5 },
    ],
  },
};

export const WhisperainSkillLevel5 = Template.bind({});
WhisperainSkillLevel5.args = {
  goal: {
    operatorName: "Whisperain",
    goalCategory: 2,
    goalName: "Skill Level 4 → 5",
    goalShortName: "Skill Level 5",
    skillLevel: 5,
    ingredients: [
      { name: "Skill Summary - 2", tier: 3, quantity: 6 },
      { name: "Oriron", tier: 2, quantity: 4 },
    ],
  },
};
