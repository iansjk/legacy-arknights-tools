import React from "react";
import { Story, Meta } from "@storybook/react";
import ItemNeeded, { ItemNeededProps } from "./ItemNeeded";
import itemData from "../data/items.json";

export default {
  title: "Planner/ItemNeeded",
  component: ItemNeeded,
  argTypes: {
    itemId: {
      options: itemData.map((item) => item.id),
      control: { type: "select" },
    },
  },
} as Meta;

const Template: Story<ItemNeededProps> = (args) => <ItemNeeded {...args} />;

export const Default = Template.bind({});
Default.args = {
  itemId: "3211",
};
