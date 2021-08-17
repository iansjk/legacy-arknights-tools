import React from "react";
import { Story, Meta } from "@storybook/react";
import OperatorGoalCard, { OperatorGoalCardProps } from "./OperatorGoalCard";
import operatorData from "../data/operators.json";
import { OperatorGoalType } from "../store/goalsSlice";

export default {
  title: "Planner/OperatorGoalCard",
  component: OperatorGoalCard,
  argTypes: {
    operatorId: {
      options: operatorData.map((op) => op.id),
      control: { type: "select" },
    },
    goal: {
      options: OperatorGoalType,
      control: { type: "select" },
    },
  },
} as Meta;

const Template: Story<OperatorGoalCardProps> = (args) => (
  <OperatorGoalCard {...args} />
);
export const Default = Template.bind({});
Default.args = {
  operatorId: "char_002_amiya",
  goal: OperatorGoalType["Elite 1"],
};
