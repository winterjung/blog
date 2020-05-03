module.exports = {
    plugins: [
        `gatsby-plugin-emotion`,
        {
            resolve: `gatsby-plugin-typography`,
            opptions: {
                pathToConfigModule: `src/utils/typography`,
            },
        },
    ],
}
