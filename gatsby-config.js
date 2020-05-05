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
    ],
}
