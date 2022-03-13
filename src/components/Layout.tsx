import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  makeStyles,
  CssBaseline,
  IconButton,
  Drawer,
  Hidden,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import clsx from "clsx";
import React from "react";
import Head from "next/head";
import AppFooter from "./AppFooter";
import NextMUILink from "./NextMUILink";
import config from "../config";

const drawerWidth = 220;

const useStyles = makeStyles((theme) => ({
  appWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  appContainer: {
    display: "flex",
  },
  content: {
    padding: theme.spacing(2),
  },
  drawer: {
    [theme.breakpoints.up("lg")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  headerFooter: {
    [theme.breakpoints.up("lg")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("lg")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  siteHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    paddingLeft: theme.spacing(2),
  },
  drawerPaper: {
    width: drawerWidth,
  },
  mainToolbar: {
    display: "flex",
  },
  pageTitle: {
    flexGrow: 1,
  },
}));

const useLinkStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.text.primary,
    "&:hover": {
      textDecoration: "none",
    },
  },
}));

function ListItemLink({ to, linkText }: { to: string; linkText: string }) {
  const classes = useLinkStyles();
  const renderLink = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement>((itemProps, ref) => (
        <li>
          <NextMUILink href={to} ref={ref} {...itemProps} />
        </li>
      )),
    [to]
  );

  return (
    <ListItem button component={renderLink}>
      <ListItemText className={classes.link} primary={linkText} />
    </ListItem>
  );
}

interface LayoutProps {
  uri: string;
  children: React.ReactNode;
  pageContext: {
    pageTitle: string;
  };
}

function Layout(props: LayoutProps): React.ReactElement {
  const { uri, children, pageContext } = props;
  const { pageTitle } = pageContext;
  const classes = useStyles();
  const { siteTitle, siteUrl, description, pages } = config;
  const title = pageTitle ? `${pageTitle} · ${siteTitle}` : siteTitle;
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  const drawer = (
    <>
      <Typography
        className={clsx(classes.toolbar, classes.siteHeader)}
        component="h1"
        variant="h5"
      >
        {siteTitle}
      </Typography>
      <Divider />
      <List>
        {pages.map(
          ({
            slug,
            pageTitle: linkedPageTitle,
          }: {
            // eslint-disable-next-line react/no-unused-prop-types
            slug: string;
            pageTitle: string;
          }) => (
            <ListItemLink key={slug} to={slug} linkText={linkedPageTitle} />
          )
        )}
      </List>
    </>
  );

  const container =
    typeof window !== "undefined" ? window.document.body : undefined;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}${uri}`} />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <div className={classes.appWrapper}>
        <div className={classes.appContainer}>
          <nav className={classes.drawer}>
            {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
            <Hidden lgUp implementation="css">
              <Drawer
                container={container}
                variant="temporary"
                anchor={theme.direction === "rtl" ? "right" : "left"}
                open={mobileOpen}
                onClose={handleDrawerToggle}
                classes={{
                  paper: classes.drawerPaper,
                }}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
              >
                {drawer}
              </Drawer>
            </Hidden>
            <Hidden mdDown implementation="css">
              <Drawer
                classes={{
                  paper: classes.drawerPaper,
                }}
                variant="permanent"
                open
              >
                {drawer}
              </Drawer>
            </Hidden>
          </nav>
          <AppBar position="fixed" className={classes.headerFooter}>
            <Toolbar className={classes.mainToolbar}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                className={classes.menuButton}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h2"
                variant="h5"
                noWrap
                className={classes.pageTitle}
              >
                {pageTitle}
              </Typography>
            </Toolbar>
          </AppBar>
          <Container className={classes.content} component="main" maxWidth="lg">
            <div className={classes.toolbar} />
            {children}
          </Container>
        </div>
        <Box flexGrow={1} />
        <AppFooter className={classes.headerFooter} />
      </div>
    </>
  );
}
export default Layout;
