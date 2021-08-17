/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import { Story, Meta } from "@storybook/react";
import OperatorImage, { OperatorImageProps } from "./OperatorImage";

export default {
  title: "OperatorImage",
  component: OperatorImage,
} as Meta;

const Template: Story<OperatorImageProps> = (args) => (
  <OperatorImage {...args} />
);

export const Empty = Template.bind({});
Empty.args = {};

export const Castle3 = Template.bind({});
Castle3.args = {
  name: "Castle-3",
};

export const CutterE1 = Template.bind({});
CutterE1.args = {
  name: "Cutter",
  elite: 1,
};

export const AmiyaE2 = Template.bind({});
AmiyaE2.args = {
  name: "Amiya",
  elite: 2,
};
