/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  flags: {
    QUERY_ON_DEMAND: true,
    FAST_REFRESH: true,
  },
  siteMetadata: {
    siteTitle: "Arknights Tools",
    siteUrl: "https://samidare.io/arknights",
    description:
      "A collection of tools for Arknights, a tower defense mobile game by Hypergryph/Yostar",
    pages: [
      {
        slug: "/planner",
        pageTitle: "Operator Planner",
      },
      {
        slug: "/recruitment",
        pageTitle: "Recruitment Calculator",
      },
      {
        slug: "/gacha",
        pageTitle: "Pull Probability Calculator",
      },
      {
        slug: "/leveling",
        pageTitle: "Leveling Costs",
      },
    ],
  },
  pathPrefix: "/arknights",
  plugins: [
    "gatsby-theme-material-ui",
    "gatsby-plugin-layout",
    "gatsby-plugin-react-helmet",
    "gatsby-transformer-json",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: "./src/data/",
      },
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/pages`,
        ignore: ["*"],
      },
    },
  ],
};
