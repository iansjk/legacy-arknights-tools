import React from "react";
import { Story, Meta } from "@storybook/react";
import OperatorGoalIconography, {
  OperatorGoalIconographyProps,
} from "./OperatorGoalIconography";
import { OperatorGoalType } from "../store/goalsSlice";

export default {
  title: "Planner/OperatorGoalIconography",
  component: OperatorGoalIconography,
  argTypes: {
    goal: {
      options: OperatorGoalType,
      control: { type: "select" },
    },
  },
} as Meta;

const Template: Story<OperatorGoalIconographyProps> = (args) => (
  <OperatorGoalIconography {...args} />
);
export const Elite1 = Template.bind({});
Elite1.args = {
  goal: OperatorGoalType["Elite 1"],
};

export const Elite2 = Template.bind({});
Elite2.args = {
  goal: OperatorGoalType["Elite 2"],
};

export const Skill1Mastery1 = Template.bind({});
Skill1Mastery1.args = {
  goal: OperatorGoalType["Skill 1 Mastery 1"],
};

export const Skill2Mastery2 = Template.bind({});
Skill2Mastery2.args = {
  goal: OperatorGoalType["Skill 2 Mastery 2"],
};

export const Skill3Mastery3 = Template.bind({});
Skill3Mastery3.args = {
  goal: OperatorGoalType["Skill 3 Mastery 3"],
};

export const SkillLevel = Template.bind({});
SkillLevel.args = {
  goal: OperatorGoalType["Skill Level 4 → 5"],
};
