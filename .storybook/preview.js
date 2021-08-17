import React from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import appTheme from "../src/gatsby-theme-material-ui-top-layout/theme";
import PlannerContext from "../src/components/PlannerContext";
import operatorData from "../src/data/operators.json";
import itemData from "../src/data/items.json";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: {
      xSmall: {
        name: "xSmall (portrait phone)",
        styles: {
          width: "360px",
          height: "640px",
        },
        type: "mobile",
      },
      small: {
        name: "Small (landscape phone)",
        styles: {
          width: "640px",
          height: "360px",
        },
        type: "mobile",
      },
      medium: {
        name: "Medium (tablet)",
        styles: {
          width: "960px",
          height: "600px",
        },
        type: "tablet",
      },
      large: {
        name: "Large (desktop)",
        styles: {
          width: "1280px",
          height: "720px",
        },
        type: "desktop",
      },
    },
  },
};

const contextValue = {
  itemMap: Object.fromEntries(itemData.map((item) => [item.id, item])),
  operatorMap: Object.fromEntries(operatorData.map((op) => [op.id, op])),
};

export const decorators = [
  (Story) => (
    <PlannerContext.Provider value={contextValue}>
      <ThemeProvider theme={appTheme}>
        <Story />
      </ThemeProvider>
    </PlannerContext.Provider>
  ),
];
