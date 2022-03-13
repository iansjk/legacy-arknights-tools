import { pink, blue } from "@material-ui/core/colors";
import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

// eslint-disable-next-line import/no-mutable-exports
let appTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: blue[700],
      light: "rgb(104, 179, 255)",
    },
    secondary: {
      main: pink[100],
    },
  },
  overrides: {
    MuiMenuItem: {
      root: {
        "&$selected": {
          "&, &:hover": {
            backgroundColor: blue[700],
          },
        },
      },
    },
    MuiFormLabel: {
      root: {
        "&$focused": {
          color: "white",
        },
      },
    },
    MuiMenu: {
      paper: {
        maxHeight: "65%",
      },
    },
    MuiListSubheader: {
      sticky: {
        position: "static",
      },
    },
  },
});
appTheme = responsiveFontSizes(appTheme);
appTheme.typography.h4.fontSize = "1.55rem";
export default appTheme;
