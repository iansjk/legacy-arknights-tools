import React from "react";
import { Story, Meta } from "@storybook/react";
import OperatorGoalCard, { OperatorGoalCardProps } from "./OperatorGoalCard";

export default {
  title: "Planner/OperatorGoalCard",
  component: OperatorGoalCard,
} as Meta;

const Template: Story<OperatorGoalCardProps> = (args) => (
  <OperatorGoalCard {...args} />
);
