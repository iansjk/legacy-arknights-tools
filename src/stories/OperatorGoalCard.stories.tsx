import React from "react";
import { Story, Meta } from "@storybook/react";
import OperatorGoalCard, {
  OperatorGoalCardProps,
} from "../components/OperatorGoalCard";
import { OperatorGoalCategory } from "../types";

export default {
  title: "Planner/OperatorGoalCard",
  component: OperatorGoalCard,
} as Meta;

const Template: Story<OperatorGoalCardProps> = (args) => (
  <OperatorGoalCard {...args} />
);

export const OperatorGoalCardDefault = Template.bind({});
OperatorGoalCardDefault.args = {
  goal: {
    operatorName: "Amiya",
    goalName: "Elite 1",
    ingredients: [{ name: "Sniper Chip Pack", tier: 3, quantity: 5 }],
    goalCategory: OperatorGoalCategory.Elite,
  },
  onDelete: () => alert("onDelete called"),
};