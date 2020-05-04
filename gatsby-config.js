module.exports = {
    siteMetadata: {
        title: `winterjung blog`,
    },
    plugins: [
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `src`,
                path: `${__dirname}/src/`,
            },
        },
        `gatsby-transformer-remark`,
        `gatsby-plugin-emotion`,
        {
            resolve: `gatsby-plugin-typography`,
            opptions: {
                pathToConfigModule: `src/utils/typography`,
            },
        },
        {
          resolve: `gatsby-plugin-manifest`,
          options: {
            name: `winterjung blog`,
            short_name: `winterjung blog`,
            start_url: `/`,
            background_color: `#ffffff`,
            theme_color: `#333333`,
            display: `standalone`,
            icon: `static/favicon.png`,
          },
        },
        `gatsby-plugin-offline`,
    ],
}
